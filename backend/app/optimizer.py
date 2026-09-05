import math
from typing import Dict, Any

class WellOptimizer:
    """
    Real-time Prescriptive Optimization Engine for Baghewala Field.
    Evaluates well-to-surface operational parameters against economic objective function.
    """
    def __init__(self):
        pass

    def evaluate_objective(
        self,
        oil_bopd: float,
        steam_tpd: float,
        power_kw: float,
        crude_price_usd_bbl: float = 75.0,
        steam_cost_usd_ton: float = 18.0,
        electricity_cost_usd_kwh: float = 0.12,
        anomaly_type: str = "NORMAL"
    ) -> float:
        """
        Computes Net Field Margin ($ / day)
        """
        revenue = oil_bopd * crude_price_usd_bbl
        steam_cost = steam_tpd * steam_cost_usd_ton
        power_cost = (power_kw * 24.0) * electricity_cost_usd_kwh
        
        # Penalty for equipment damage / inefficient operations
        penalty = 0.0
        if anomaly_type == "FLUID_POUND":
            penalty = 450.0 # High mechanical stress on gearbox & rod string
        elif anomaly_type == "GAS_LOCK":
            penalty = 300.0 # Zero volumetric efficiency
        elif anomaly_type == "TUBING_LEAK":
            penalty = 250.0
            
        net_profit = revenue - steam_cost - power_cost - penalty
        return round(net_profit, 2)

    def optimize_well(
        self,
        well_data: Dict[str, Any],
        crude_price_usd_bbl: float = 75.0,
        steam_cost_usd_ton: float = 18.0,
        electricity_cost_usd_kwh: float = 0.12
    ) -> Dict[str, Any]:
        """
        Solves optimal operational target parameters:
        - Optimal SPM
        - Recommended Steam Cutoff / Soak transition
        - Optimal Choke aperture
        - Projected daily gain ($ / day)
        """
        current_spm = well_data.get("spm", 6.0)
        current_oil = well_data.get("oil_rate_bopd", 120.0)
        current_steam = well_data.get("steam_rate_tpd", 80.0)
        current_power = well_data.get("power_kw", 42.0)
        anomaly = well_data.get("anomaly", "NORMAL")
        phase = well_data.get("phase", "PRODUCTION")
        choke = well_data.get("choke_pct", 75.0)

        current_profit = self.evaluate_objective(
            current_oil, current_steam, current_power,
            crude_price_usd_bbl, steam_cost_usd_ton, electricity_cost_usd_kwh, anomaly
        )

        # Bounded scenario search.  This is intentionally an interpretable
        # surrogate, not a trained ML model or an autonomous controller.
        # It combines pump capacity, fillage risk and choke back-pressure into
        # every candidate before calculating margin.
        candidates = []
        if phase == "PRODUCTION":
            for candidate_spm in [round(x * 0.5, 1) for x in range(7, 18)]:
                for candidate_choke in range(45, 96, 5):
                    speed_ratio = candidate_spm / max(current_spm, 0.1)
                    choke_factor = 1.0 - 0.0009 * (candidate_choke - 72.0) ** 2
                    fillage_factor = 1.0
                    candidate_anomaly = "NORMAL"
                    if anomaly == "FLUID_POUND" and candidate_spm > 5.5:
                        fillage_factor, candidate_anomaly = 0.72, "FLUID_POUND"
                    elif anomaly == "GAS_LOCK" and candidate_choke < 75:
                        fillage_factor, candidate_anomaly = 0.78, "GAS_LOCK"
                    elif anomaly == "VISCOUS_DRAG" and candidate_spm > 7.5:
                        fillage_factor, candidate_anomaly = 0.86, "VISCOUS_DRAG"
                    capacity_factor = min(1.18, speed_ratio) * fillage_factor * max(0.75, choke_factor)
                    candidate_oil = max(0.0, current_oil * capacity_factor)
                    candidate_power = max(0.0, current_power * (candidate_spm / max(current_spm, 0.1)) ** 1.35)
                    margin = self.evaluate_objective(candidate_oil, current_steam, candidate_power,
                                                     crude_price_usd_bbl, steam_cost_usd_ton,
                                                     electricity_cost_usd_kwh, candidate_anomaly)
                    candidates.append({"spm": candidate_spm, "choke": candidate_choke,
                                       "oil_bopd": round(candidate_oil, 1), "power_kw": round(candidate_power, 1),
                                       "margin": margin, "risk": candidate_anomaly})
            best = max(candidates, key=lambda c: c["margin"])
            target_spm, target_choke, target_steam = best["spm"], best["choke"], current_steam
            opt_oil, opt_power, opt_profit = best["oil_bopd"], best["power_kw"], best["margin"]
        else:
            target_spm, target_choke, target_steam = 0.0, choke, current_steam
            opt_oil, opt_power, opt_profit = 0.0, 0.0, current_profit
            candidates = []

        recs = []
        if phase != "PRODUCTION":
            recs.append("No lift-speed change proposed while the well is outside production. Complete the CSS phase gate first.")
        elif anomaly == "FLUID_POUND":
            recs.append(f"Move from {current_spm} to {target_spm} SPM; candidates above 5.5 SPM retain a fluid-pound risk penalty.")
        elif anomaly == "GAS_LOCK":
            recs.append(f"Set choke near {target_choke}% and SPM at {target_spm}; this keeps the gas-lock constraint out of the selected scenario.")
        elif anomaly == "VISCOUS_DRAG":
            recs.append(f"Use {target_spm} SPM and {target_choke}% choke; higher speed candidates are penalized for viscous-drag risk.")
        else:
            recs.append(f"Best bounded scenario is {target_spm} SPM and {target_choke}% choke under the supplied price assumptions.")

        if phase == "INJECTION" and well_data.get("days_in_phase", 0) > 12:
            recs.append("Review the injection-to-soak transition; this model does not automatically switch the CSS phase.")
        
        profit_delta = round(opt_profit - current_profit, 2)

        return {
            "current_daily_profit_usd": current_profit,
            "optimized_daily_profit_usd": opt_profit,
            "potential_gain_usd_day": profit_delta,
            "gain_percentage": round((profit_delta / max(1.0, abs(current_profit))) * 100.0, 1),
            "target_spm": target_spm,
            "target_choke_pct": target_choke,
            "target_steam_tpd": target_steam,
            "recommendations": recs,
            "method": "bounded physics-informed scenario search",
            "decision_status": "REVIEW_REQUIRED",
            "assumptions": {"crude_price_usd_bbl": crude_price_usd_bbl, "steam_cost_usd_ton": steam_cost_usd_ton, "electricity_cost_usd_kwh": electricity_cost_usd_kwh},
            "selected_scenario": {"oil_bopd": opt_oil, "power_kw": opt_power, "risk_flag": best["risk"] if candidates else "PHASE_GATE"},
            "candidate_count": len(candidates)
        }
