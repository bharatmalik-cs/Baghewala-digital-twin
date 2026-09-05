from typing import Dict, Any, List

class FieldAssistant:
    """
    AI Field Operations Assistant for Baghewala Heavy Oil Field.
    Provides natural language explanations, physics calculations, and troubleshooting.
    """
    def __init__(self):
        self.knowledge_base = {
            "fluid_pound": (
                "Fluid Pound in Baghewala SRP wells occurs when the pump barrel does not fully fill with heavy oil "
                "during the upstroke, causing the plunger to strike fluid on downstroke. "
                "Recommendation: Reduce SRP speed (SPM) from current setting down to 4.5–5.2 SPM to align stroke volume with fluid inflow, "
                "or increase steam injection soak time to lower reservoir crude viscosity."
            ),
            "gas_lock": (
                "Gas Lock occurs when free gas released from heated crude gets trapped in the pump barrel, compressing "
                "and expanding without opening travelling or standing valves. "
                "Recommendation: Increase surface choke aperture by 15–20% and slow SPM to 4.0–4.5 to bleed gas."
            ),
            "css_soak": (
                "Cyclic Steam Stimulation (CSS) Soak Phase allows high-enthalpy steam injected at ~240°C to transfer "
                "heat into the Jodhpur Sandstone pay zone (18m thickness). "
                "Recommendation: Maintain 5 to 7 days soak time until mean reservoir temperature stabilizes above 120°C, "
                "reducing dead oil viscosity from 3,500 cP to below 50 cP before initiating SRP production."
            ),
            "sor_optimization": (
                "Steam-to-Oil Ratio (cSOR) in Baghewala Field averages 3.2–3.8 bbl steam per bbl oil produced. "
                "To optimize cSOR, terminate steam injection when thermal plume radius exceeds 18m or when instantaneous SOR (iSOR) "
                "rises above 8.0, preventing runaway steam breakthrough."
            )
        }

    def answer_query(self, query: str, context: Dict[str, Any]) -> str:
        q_lower = query.lower()
        well_id = context.get("well_id", "BGW-01")
        anomaly = context.get("srp_physics", {}).get("anomaly_detected", "NORMAL")
        spm = context.get("spm", 6.0)
        oil_bopd = context.get("oil_rate_bopd", 120.0)
        temp_c = context.get("css_physics", {}).get("reservoir_temp_c", 140.0)
        visc_cp = context.get("css_physics", {}).get("oil_viscosity_cp", 45.0)

        if "fluid pound" in q_lower or "pound" in q_lower:
            return (
                f"🤖 **Baghewala AI Agent**: For well {well_id} (currently at {spm} SPM and producing {oil_bopd} BOPD):\n\n"
                f"{self.knowledge_base['fluid_pound']}\n\n"
                f"**Current Well State**: Anomaly detected: **{anomaly}**. Reservoir Temp: {temp_c}°C ({visc_cp} cP)."
            )
        elif "gas lock" in q_lower or "gas" in q_lower:
            return (
                f"🤖 **Baghewala AI Agent**: For well {well_id}:\n\n"
                f"{self.knowledge_base['gas_lock']}"
            )
        elif "soak" in q_lower or "injection" in q_lower or "css" in q_lower:
            return (
                f"🤖 **Baghewala AI Agent**: CSS Thermal Guidance for {well_id}:\n\n"
                f"{self.knowledge_base['css_soak']}\n\n"
                f"Currently in phase **{context.get('phase', 'PRODUCTION')}** (Day {context.get('days_in_phase', 12)})."
            )
        elif "sor" in q_lower or "steam oil" in q_lower:
            return (
                f"🤖 **Baghewala AI Agent**: Energy Efficiency & SOR Insights:\n\n"
                f"{self.knowledge_base['sor_optimization']}\n\n"
                f"Current Field cSOR: **{context.get('css_physics', {}).get('csor', 3.4)} bbl/bbl**."
            )
        elif "profit" in q_lower or "economic" in q_lower or "price" in q_lower:
            gain = context.get("optimization", {}).get("potential_gain_usd_day", 2300.0)
            return (
                f"🤖 **Baghewala AI Agent**: Economic Optimization Report for {well_id}:\n\n"
                f"Applying AI prescriptive SPM and choke targets yields an estimated **+${gain} / day** net profit uplift (+{context.get('optimization', {}).get('gain_percentage', 25)}%)."
            )
        else:
            return (
                f"🤖 **Baghewala AI Agent**: Hello Field Engineer! I am monitoring **Baghewala Field Well {well_id}**.\n\n"
                f"- **Current SPM**: {spm}\n"
                f"- **Production Rate**: {oil_bopd} BOPD\n"
                f"- **Reservoir Temperature**: {temp_c}°C (Viscosity: {visc_cp} cP)\n"
                f"- **SRP Status**: {anomaly}\n\n"
                f"How can I assist with CSS thermal cycle planning, Dynacard troubleshooting, or well-to-surface pressure optimization today?"
            )
