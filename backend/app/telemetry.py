import time
from typing import Dict, Any, List

from app.physics.css_model import CSSModel
from app.physics.srp_model import SRPModel
from app.physics.hydraulics import HydraulicsModel
from app.optimizer import WellOptimizer

class BaghewalaFieldSimulator:
    """
    Multi-Well Telemetry Simulator for Baghewala Field Digital Twin.
    """
    def __init__(self):
        self.css = CSSModel()
        self.srp = SRPModel()
        self.hydraulics = HydraulicsModel()
        self.optimizer = WellOptimizer()
        
        # Initial state for Baghewala Wells
        self.wells: Dict[str, Dict[str, Any]] = {
            "BGW-01": {
                "well_id": "BGW-01",
                "well_name": "Baghewala Pad-A #01",
                "phase": "PRODUCTION",
                "days_in_phase": 24.5,
                "spm": 6.2,
                "stroke_length_in": 120.0,
                "choke_pct": 70.0,
                "steam_rate_tpd": 0.0,
                "steam_quality": 0.85,
                "cumulative_oil_bbl": 14200.0,
                "cumulative_steam_bbl": 48000.0,
                "anomaly": "NORMAL",
                "fillage_pct": 92.0
            },
            "BGW-04": {
                "well_id": "BGW-04",
                "well_name": "Baghewala Pad-A #04",
                "phase": "PRODUCTION",
                "days_in_phase": 42.0,
                "spm": 8.8,
                "stroke_length_in": 100.0,
                "choke_pct": 80.0,
                "steam_rate_tpd": 0.0,
                "steam_quality": 0.80,
                "cumulative_oil_bbl": 9800.0,
                "cumulative_steam_bbl": 41000.0,
                "anomaly": "FLUID_POUND",
                "fillage_pct": 62.0
            },
            "BGW-07": {
                "well_id": "BGW-07",
                "well_name": "Baghewala Pad-B #07",
                "phase": "INJECTION",
                "days_in_phase": 11.2,
                "spm": 0.0,
                "stroke_length_in": 120.0,
                "choke_pct": 40.0,
                "steam_rate_tpd": 115.0,
                "steam_quality": 0.88,
                "cumulative_oil_bbl": 18500.0,
                "cumulative_steam_bbl": 62000.0,
                "anomaly": "NORMAL",
                "fillage_pct": 100.0
            },
            "BGW-12": {
                "well_id": "BGW-12",
                "well_name": "Baghewala Pad-C #12",
                "phase": "PRODUCTION",
                "days_in_phase": 18.0,
                "spm": 5.0,
                "stroke_length_in": 144.0,
                "choke_pct": 65.0,
                "steam_rate_tpd": 0.0,
                "steam_quality": 0.85,
                "cumulative_oil_bbl": 22100.0,
                "cumulative_steam_bbl": 74000.0,
                "anomaly": "VISCOUS_DRAG",
                "fillage_pct": 88.0
            }
        }
        self.last_economics: Dict[str, Dict[str, float]] = {}
        self.action_log: Dict[str, List[Dict[str, Any]]] = {well_id: [] for well_id in self.wells}

    def get_well_telemetry(self, well_id: str, economics: Dict[str, float] | None = None) -> Dict[str, Any]:
        """
        Executes full physics loop for a single well and returns real-time snapshot.
        """
        if well_id not in self.wells:
            well_id = "BGW-01"
            
        w = self.wells[well_id]
        
        # 1. Run CSS Thermal Reservoir Simulation
        css_res = self.css.simulate_css_cycle(
            phase=w["phase"],
            days_in_phase=w["days_in_phase"],
            steam_rate_tpd=w["steam_rate_tpd"],
            steam_quality=w["steam_quality"],
            cumulative_oil_bbl=w["cumulative_oil_bbl"],
            cumulative_steam_bbl=w["cumulative_steam_bbl"]
        )
        
        oil_bopd = css_res["estimated_oil_bopd"]
        viscosity_cp = css_res["oil_viscosity_cp"]
        
        # Keep simulated readings stable until a setpoint or phase changes.
        # Per-request random noise made recommendations appear to drift.
        oil_bopd = round(oil_bopd, 1)
            
        # 2. Run SRP Dynacard Wave Equation Solver
        if w["phase"] == "PRODUCTION":
            srp_res = self.srp.generate_dynacard(
                spm=w["spm"],
                stroke_length_in=w["stroke_length_in"],
                fluid_viscosity_cp=viscosity_cp,
                anomaly_type=w["anomaly"],
                fillage_pct=w["fillage_pct"]
            )
        else:
            # Standby / Steam Injection mode (SRP stopped)
            srp_res = {
                "surface_card": [],
                "downhole_card": [],
                "peak_load_lb": 0.0,
                "min_load_lb": 0.0,
                "peak_torque_k_in_lb": 0.0,
                "power_kw": 0.0,
                "pump_fillage_pct": 100.0,
                "anomaly_detected": "INJECTION_STANDBY",
                "confidence_pct": 100.0
            }
            
        # 3. Run Wellbore & Surface Network Hydraulics
        hyd_res = self.hydraulics.calculate_network_pressures(
            oil_rate_bopd=oil_bopd,
            fluid_viscosity_cp=viscosity_cp,
            choke_open_pct=w["choke_pct"]
        )
        
        # 4. Run Prescriptive Optimizer
        economics = economics or self.last_economics.get(well_id, {})
        opt_res = self.optimizer.optimize_well({
            "spm": w["spm"],
            "oil_rate_bopd": oil_bopd,
            "steam_rate_tpd": w["steam_rate_tpd"],
            "power_kw": srp_res["power_kw"],
            "anomaly": w["anomaly"],
            "phase": w["phase"],
            "days_in_phase": w["days_in_phase"],
            "choke_pct": w["choke_pct"]
        }, **economics)

        # 5. Run Neural Network MLP Surrogate Inference (scikit-learn JSON model forward pass)
        try:
            from app.mlp_inference import get_mlp_models
            import math
            margin_model, risk_model = get_mlp_models()
            if margin_model and risk_model:
                feature_vec = [
                    float(viscosity_cp),
                    float(math.exp(-0.08 * w.get("days_in_phase", 1.0))),
                    float(hyd_res.get("reservoir_pressure_bar", 110.0)),
                    float(w["spm"]),
                    float(w["choke_pct"]),
                    float(w["steam_rate_tpd"])
                ]
                nn_margin = margin_model.predict_margin(feature_vec)
                nn_risk_label, nn_risk_probs = risk_model.predict_risk(feature_vec)
                nn_res = {
                    "predicted_margin_usd_day": round(nn_margin, 2),
                    "predicted_risk_flag": nn_risk_label,
                    "class_probabilities": {k: round(v, 3) for k, v in nn_risk_probs.items()}
                }
            else:
                nn_res = None
        except Exception:
            nn_res = None

        return {
            "timestamp": time.time(),
            "well_id": w["well_id"],
            "well_name": w["well_name"],
            "phase": w["phase"],
            "days_in_phase": round(w["days_in_phase"], 1),
            "spm": w["spm"],
            "stroke_length_in": w["stroke_length_in"],
            "choke_pct": w["choke_pct"],
            "steam_rate_tpd": w["steam_rate_tpd"],
            "oil_rate_bopd": oil_bopd,
            "css_physics": css_res,
            "srp_physics": srp_res,
            "hydraulics": hyd_res,
            "optimization": opt_res,
            "neural_network_surrogate": nn_res,
            "data_provenance": {
                "mode": "SIMULATED_DEMO",
                "refresh_seconds": 6.0,
                "models": ["CSS thermal surrogate", "SRP dynacard mechanics", "hydraulics pressure model", "MLP Neural Network surrogate", "bounded optimization"],
                "operator_note": "Recommendations require operator review; connect historian and validate against field tests before operational use."
            }
        }

    def optimize_well(self, well_id: str, economics: Dict[str, float]) -> Dict[str, Any]:
        """Return an evaluated scenario; do not silently alter equipment controls."""
        if well_id not in self.wells:
            well_id = "BGW-01"
        self.last_economics[well_id] = economics
        self.action_log[well_id].append({
            "timestamp": time.time(), "event": "SCENARIO_EVALUATED",
            "detail": "Physics-informed operating scenario evaluated; operator review required."
        })
        return self.get_well_telemetry(well_id, economics)

    def get_action_log(self, well_id: str) -> List[Dict[str, Any]]:
        return list(reversed(self.action_log.get(well_id, [])))[:12]

    def update_well_controls(self, well_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """
        Updates interactive controls for a well (e.g. set SPM, change phase, change choke).
        """
        if well_id in self.wells:
            # A CSS phase transition has material operating constraints.  Keep
            # demo controls internally consistent instead of displaying a
            # running pump during steam injection or soaking.
            if "phase" in updates:
                phase = updates["phase"]
                if phase not in {"INJECTION", "SOAKING", "PRODUCTION"}:
                    raise ValueError("phase must be INJECTION, SOAKING, or PRODUCTION")
                updates["days_in_phase"] = 0.0
                if phase == "INJECTION":
                    updates.update({"spm": 0.0, "steam_rate_tpd": 115.0, "choke_pct": 40.0})
                elif phase == "SOAKING":
                    updates.update({"spm": 0.0, "steam_rate_tpd": 0.0})
                else:
                    updates.update({"spm": 5.0, "steam_rate_tpd": 0.0})
            for key, val in updates.items():
                if key in self.wells[well_id]:
                    self.wells[well_id][key] = val

            self.action_log[well_id].append({
                "timestamp": time.time(), "event": "SETPOINT_UPDATED",
                "detail": ", ".join(f"{key}={value}" for key, value in updates.items())
            })
                    
            # Auto update anomaly if SPM changed to match inflow
            if "spm" in updates and self.wells[well_id]["anomaly"] == "FLUID_POUND":
                if updates["spm"] <= 5.5:
                    self.wells[well_id]["anomaly"] = "NORMAL"
                    self.wells[well_id]["fillage_pct"] = 90.0

        return self.get_well_telemetry(well_id)

    def get_field_summary(self) -> Dict[str, Any]:
        """
        Returns aggregated KPIs across all Baghewala field wells.
        """
        total_oil = 0.0
        total_steam = 0.0
        total_power = 0.0
        wells_summary = []
        
        for w_id in self.wells:
            telem = self.get_well_telemetry(w_id)
            total_oil += telem["oil_rate_bopd"]
            total_steam += telem["steam_rate_tpd"]
            total_power += telem["srp_physics"]["power_kw"]
            wells_summary.append({
                "well_id": telem["well_id"],
                "well_name": telem["well_name"],
                "phase": telem["phase"],
                "oil_rate_bopd": telem["oil_rate_bopd"],
                "steam_rate_tpd": telem["steam_rate_tpd"],
                "spm": telem["spm"],
                "anomaly": telem["srp_physics"]["anomaly_detected"]
            })
            
        field_csor = round((total_steam * 6.29) / max(1.0, total_oil), 2)
        
        return {
            "total_oil_bopd": round(total_oil, 1),
            "total_steam_tpd": round(total_steam, 1),
            "total_power_kw": round(total_power, 1),
            "field_csor": field_csor,
            "active_wells_count": len(self.wells),
            "wells": wells_summary
        }
