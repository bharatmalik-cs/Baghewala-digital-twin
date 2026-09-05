import math

class HydraulicsModel:
    """
    Well-to-Surface Hydraulic Flow Engine for Baghewala Field.
    Calculates multiphase pressure drops from downhole pump intake to surface separator.
    """
    def __init__(self):
        self.depth_m = 1050.0
        self.tubing_inner_dia_m = 0.076 # 3 inch tubing
        self.surface_flowline_length_m = 2400.0 # 2.4 km flowline to Baghewala Gathering Station
        self.flowline_inner_dia_m = 0.102 # 4 inch line

    def calculate_network_pressures(
        self,
        oil_rate_bopd: float,
        fluid_viscosity_cp: float,
        choke_open_pct: float,
        reservoir_pressure_bar: float = 85.0
    ) -> dict:
        """
        Computes pressure profile along the entire production system:
        Reservoir -> Pump Intake (PIP) -> Wellhead Pressure (WHP) -> Line Pressure -> Separator Pressure.
        """
        # Conversion BOPD to m3/s
        q_m3_s = (oil_rate_bopd * 0.158987) / 86400.0
        oil_density = 960.0 # kg/m3
        
        # 1. Reservoir Inflow Performance (IPR)
        ipr_productivity_index = 0.85 # BOPD / bar
        pip_bar = max(12.0, reservoir_pressure_bar - (oil_rate_bopd / ipr_productivity_index))
        
        # 2. Vertical Tubing Pressure Drop
        # Hydrostatic head
        p_hydrostatic = (oil_density * 9.81 * self.depth_m) / 1e5 # Bar
        
        # Friction loss (Darcy-Weisbach with heavy oil viscosity)
        area_tubing = math.pi * ((self.tubing_inner_dia_m / 2) ** 2)
        velocity_tubing = q_m3_s / area_tubing
        reynolds_tubing = (oil_density * velocity_tubing * self.tubing_inner_dia_m) / (fluid_viscosity_cp * 0.001)
        
        friction_factor = 64.0 / max(1.0, reynolds_tubing) if reynolds_tubing < 2100 else 0.3164 / (reynolds_tubing ** 0.25)
        p_friction_tubing = (friction_factor * (self.depth_m / self.tubing_inner_dia_m) * 0.5 * oil_density * (velocity_tubing ** 2)) / 1e5
        
        # Wellhead Pressure (WHP)
        whp_bar = round(max(4.5, pip_bar + 18.0 - p_friction_tubing * 1.2), 2)
        
        # 3. Surface Choke Valve Throttling
        choke_fraction = max(0.05, choke_open_pct / 100.0)
        choke_dp_bar = (0.5 * oil_density * ((velocity_tubing / choke_fraction) ** 2)) / 1e5
        choke_dp_bar = round(min(whp_bar - 2.0, max(0.2, choke_dp_bar)), 2)
        
        post_choke_pressure_bar = round(max(2.5, whp_bar - choke_dp_bar), 2)
        
        # 4. Surface Flowline to Separator
        area_flowline = math.pi * ((self.flowline_inner_dia_m / 2) ** 2)
        velocity_flowline = q_m3_s / area_flowline
        reynolds_flowline = (oil_density * velocity_flowline * self.flowline_inner_dia_m) / (fluid_viscosity_cp * 0.001)
        ff_flowline = 64.0 / max(1.0, reynolds_flowline) if reynolds_flowline < 2100 else 0.03
        
        flowline_dp_bar = round((ff_flowline * (self.surface_flowline_length_m / self.flowline_inner_dia_m) * 0.5 * oil_density * (velocity_flowline ** 2)) / 1e5, 2)
        separator_pressure_bar = round(max(1.8, post_choke_pressure_bar - flowline_dp_bar), 2)

        return {
            "reservoir_pressure_bar": round(reservoir_pressure_bar, 1),
            "pump_intake_pressure_bar": round(pip_bar, 1),
            "wellhead_pressure_bar": whp_bar,
            "choke_dp_bar": choke_dp_bar,
            "post_choke_pressure_bar": post_choke_pressure_bar,
            "flowline_dp_bar": flowline_dp_bar,
            "separator_pressure_bar": separator_pressure_bar,
            "tubing_flow_velocity_m_s": round(velocity_tubing, 3),
            "reynolds_number": round(reynolds_tubing, 1)
        }
