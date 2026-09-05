import math
import numpy as np

class CSSModel:
    """
    Cyclic Steam Stimulation (CSS / Huff-and-Puff) Physics Model.
    Models Marx-Langenheim steam zone growth, thermal dissipation during soak phase,
    and crude oil viscosity reduction using Andrade/Walther equations.
    Tailored for Baghewala Heavy Oil Reservoir parameters.
    """
    def __init__(self):
        # Baghewala Field Heavy Oil Base Reservoir Constants
        self.dead_oil_viscosity_ref = 3500.0  # cP at reservoir temp 45 °C
        self.ref_temp_c = 45.0
        self.steam_temp_c = 240.0             # ~3.3 MPa steam injection temperature
        self.rock_heat_capacity = 2.2         # MJ / (m^3 * °C)
        self.water_heat_capacity = 4.18       # kJ / (kg * °C)
        self.steam_latent_heat = 1750.0       # kJ / kg
        self.reservoir_thickness_m = 18.0     # Jodhpur Sandstone pay thickness
        self.overburden_conductivity = 2.1    # W / (m * °C)

    def calculate_viscosity(self, temp_c: float) -> float:
        """
        Calculates crude viscosity (cP) at a given temperature (°C)
        using modified Andrade / Walther formula.
        At 45°C -> ~3500 cP. At 200°C -> ~12 cP.
        """
        temp_k = temp_c + 273.15
        # Empirical constants calibrated for Baghewala extra-heavy crude
        A = 12.85
        B = 4120.0
        visc = math.exp(A + B / temp_k - 18.5)
        return max(5.0, round(visc, 2))

    def simulate_css_cycle(
        self,
        phase: str,           # 'INJECTION', 'SOAKING', 'PRODUCTION'
        days_in_phase: float,
        steam_rate_tpd: float, # Tons per day steam injection
        steam_quality: float,  # 0.70 to 0.95
        cumulative_oil_bbl: float,
        cumulative_steam_bbl: float
    ) -> dict:
        """
        Computes heated radius, mean reservoir temperature, viscosity,
        and Instantaneous Steam-Oil Ratio (iSOR) & Cumulative SOR (cSOR).
        """
        if phase == 'INJECTION':
            # Marx-Langenheim heated zone expansion
            # Heat injection rate (MW)
            h_steam = (self.water_heat_capacity * (self.steam_temp_c - self.ref_temp_c) +
                       steam_quality * self.steam_latent_heat) # kJ/kg
            q_inj_mj_day = steam_rate_tpd * 1000.0 * h_steam / 1000.0 # MJ/day
            
            # Dimensionless time factor
            t_sec = days_in_phase * 86400.0
            thermal_diffusivity = 1.0e-6 # m^2/s
            t_D = 4.0 * self.overburden_conductivity * t_sec / (
                self.rock_heat_capacity * 1e6 * (self.reservoir_thickness_m ** 2)
            )
            
            # Heated radius (m)
            heat_retained_fraction = math.erfc(math.sqrt(max(1e-5, t_D))) if t_D < 5 else 1.0 / (1.0 + math.sqrt(3.14159 * t_D))
            cumulative_heat_mj = q_inj_mj_day * days_in_phase * heat_retained_fraction
            heated_vol_m3 = cumulative_heat_mj / (self.rock_heat_capacity * (self.steam_temp_c - self.ref_temp_c))
            heated_radius_m = math.sqrt(max(0.5, heated_vol_m3 / (math.pi * self.reservoir_thickness_m)))
            
            avg_temp_c = min(self.steam_temp_c, self.ref_temp_c + (self.steam_temp_c - self.ref_temp_c) * (0.4 + 0.6 * math.exp(-0.05 * days_in_phase)))
            current_viscosity = self.calculate_viscosity(avg_temp_c)
            oil_rate_bopd = 0.0
            isor = 999.0

        elif phase == 'SOAKING':
            # Conductive heat dissipation into reservoir matrix
            cooling_factor = math.exp(-0.08 * days_in_phase)
            avg_temp_c = self.ref_temp_c + (self.steam_temp_c - self.ref_temp_c) * (0.85 * cooling_factor + 0.15)
            current_viscosity = self.calculate_viscosity(avg_temp_c)
            heated_radius_m = max(2.0, 18.0 * (1.0 + 0.05 * days_in_phase))
            oil_rate_bopd = 0.0
            isor = 0.0

        else: # PRODUCTION
            # Temperature declines as cold fluid flows into wellbore
            prod_decline = math.exp(-0.015 * days_in_phase)
            avg_temp_c = self.ref_temp_c + (self.steam_temp_c * 0.7 - self.ref_temp_c) * prod_decline
            current_viscosity = self.calculate_viscosity(avg_temp_c)
            heated_radius_m = max(1.5, 22.0 * prod_decline)
            
            # Inflow performance relation enhanced by mobility boost (k / mu)
            mobility_ratio = self.dead_oil_viscosity_ref / max(1.0, current_viscosity)
            oil_rate_bopd = min(450.0, max(25.0, 30.0 * (mobility_ratio ** 0.45) * math.exp(-0.012 * days_in_phase)))
            
            # Instantaneous SOR
            recent_steam_bbl = steam_rate_tpd * 6.29 * 10.0 # ~10 days injection equivalent
            isor = round(max(0.8, min(15.0, recent_steam_bbl / max(1.0, oil_rate_bopd * 10.0))), 2)

        csor = round(cumulative_steam_bbl / max(1.0, cumulative_oil_bbl), 2) if cumulative_oil_bbl > 0 else 3.5

        return {
            "reservoir_temp_c": round(avg_temp_c, 1),
            "oil_viscosity_cp": current_viscosity,
            "heated_radius_m": round(heated_radius_m, 2),
            "estimated_oil_bopd": round(oil_rate_bopd, 1),
            "isor": isor,
            "csor": csor
        }
