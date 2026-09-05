# 🛢️ Digital Twin for Well-to-Surface Optimization of CSS & SRP Operations
### Heavy Oil Recovery — Baghewala Field (Oil India Limited, Rajasthan)

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Build-Vite_8-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38BDF8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 Executive Summary

The **Baghewala Heavy Oil Field** (located in the Bikaner-Nagaur basin, Rajasthan, operated by Oil India Limited) contains extra-heavy paraffinic crude oil with extreme dead-oil viscosity ($\sim 3,500 \, \text{cP}$ at reservoir temperature $45^\circ\text{C}$, $11^\circ - 17^\circ \, \text{API}$).

Primary thermal recovery relies on **Cyclic Steam Stimulation (CSS / Huff-and-Puff)** coupled with **Sucker Rod Pumping (SRP)** artificial lift. However, operations suffer from high Steam-to-Oil Ratios ($\text{cSOR} > 3.5$), severe pump mechanical stress (**Fluid Pound**, **Gas Lock**, **Viscous Drag**), and uncoupled downhole-to-surface pressure losses.

This **hackathon prototype** couples domain-specific reservoir physics and lift dynamics with WebSocket-delivered **simulated telemetry**, an interpretable scenario optimizer, and a modern interactive web dashboard. It is a decision-support demonstrator—not a field control system.

---

## 🌟 Key Features & Domain Physics Models

### 1. CSS Thermal Recovery Physics (Marx-Langenheim Model)
- **Heated Zone Growth**: Models thermal front radius ($r_h$) expansion into the Jodhpur Sandstone pay zone ($18\,\text{m}$ thickness).
- **Viscosity Reduction**: **Andrade / Walther** logarithmic viscosity curve solver reducing dead oil viscosity from $3,500\,\text{cP}$ to $< 50\,\text{cP}$ at $140^\circ\text{C}+$.
- **Energy Efficiency**: Instantaneous SOR ($\text{iSOR}$) and Cumulative SOR ($\text{cSOR}$) tracking across 3-phase cycles (**Injection $\to$ Soaking $\to$ Production**).

### 2. Sucker Rod Pump (SRP) 1D Wave Dynamics & Dynacards
- **Gibbs 1D Damped Wave Inversion**: Converts surface polished rod dynamometer load-displacement curves into downhole pump cards by solving:
  $$\frac{\partial^2 u}{\partial t^2} = a^2 \frac{\partial^2 u}{\partial x^2} - v \frac{\partial u}{\partial t} + g$$
- **Real-Time Fault Classification**: Detects **Fluid Pound** (incomplete pump filling), **Gas Lock** (trapped barrel gas), **Tubing Leak**, and **Viscous Friction Drag**.

### 3. Integrated Well-to-Surface Flowlines (Beggs & Brill Hydraulics)
- Multiphase hydraulic pressure profile across 4 nodes:
  $$\text{Pump Intake (PIP)} \longrightarrow \text{Wellhead (WHP)} \longrightarrow \text{Choke Valve} \longrightarrow 2.4\,\text{km Flowline} \longrightarrow \text{Central Separator}$$
- Dynamic surface choke aperture slider ($10\% - 100\%$) for live pressure drop throttling.

### 4. Interactive 3D/Canvas Schematics & Spatial GIS Map
- **3D Pump Jack Canvas**: HTML5 Canvas rendering surface walking beam reciprocating in sync with current SPM, rod string motion, plunger ball valve dynamics, and glowing thermal plume in rock matrix.
- **Spatial GIS Topology Map**: Map view of Baghewala Pad-A, Pad-B, Pad-C, central steam generation facility, and surface trunk pipelines.

### 5. Decision Support & Twin Assistant
- **Scenario optimizer**: evaluates bounded SPM/choke candidates against a transparent margin equation, pump-risk constraints, and the user-entered crude, steam, and power costs.
- **Rule-based twin assistant**: gives domain guidance grounded in the current simulated well snapshot. It does not claim to be a trained LLM or issue autonomous instructions.
- **Executive Exporter**: One-click JSON/CSV field audit telemetry downloader.

---

## 🛠️ Project Structure

```
baghewala-digital-twin/
├── backend/                  # Python FastAPI Backend Physics Engine
│   ├── app/
│   │   ├── main.py           # REST endpoints & WebSocket streamer
│   │   ├── telemetry.py      # Multi-well simulator & state manager
│   │   ├── optimizer.py      # Economic prescriptive optimizer
│   │   ├── assistant.py      # AI heavy oil assistant knowledge base
│   │   └── physics/
│   │       ├── css_model.py  # Marx-Langenheim thermal recovery model
│   │       ├── srp_model.py  # Gibbs 1D wave equation Dynacard solver
│   │       └── hydraulics.py # Beggs & Brill wellbore & surface network
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                 # Vite + React 19 + Tailwind CSS v4 Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx             # Real-time field KPI bar
│   │   │   ├── WellSelector.jsx       # Multi-well switcher tabs
│   │   │   ├── PumpJack3DCanvas.jsx   # Animated surface lift & wellbore canvas
│   │   │   ├── DynacardViewer.jsx     # Surface & solved downhole Dynacard plot
│   │   │   ├── FieldMap.jsx           # Spatial GIS network map
│   │   │   ├── CSSPhaseManager.jsx    # Thermal recovery cycle manager
│   │   │   ├── SurfaceNetworkMap.jsx   # Flowline pressure profile & choke control
│   │   │   ├── OptimizationPanel.jsx  # Prescriptive AI control & What-If sandbox
│   │   │   ├── AIAssistant.jsx        # Digital Twin chat drawer
│   │   │   └── AnalyticsReport.jsx    # Production analytics & report exporter
│   │   ├── services/
│   │   │   └── api.js                 # REST & WebSocket client
│   │   ├── App.jsx
│   │   └── index.css
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml        # Full-stack container orchestration
├── start_app.sh              # One-click launcher script
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (tested on v24.12)
- **Python**: 3.9+ (tested on 3.14)

### Method 1: Local One-Click Execution (Recommended)

Run the included launcher script from the Desktop project directory:
```bash
cd ~/Desktop/baghewala-digital-twin
chmod +x start_app.sh
./start_app.sh
```

- **Frontend Application**: `http://localhost:3000`
- **Backend API & WebSockets**: `http://localhost:8000`

---

### Method 2: Manual Terminal Launch

#### Step 1: Launch Python FastAPI Backend
```bash
cd ~/Desktop/baghewala-digital-twin/backend
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### Step 2: Launch Vite React Frontend
```bash
cd ~/Desktop/baghewala-digital-twin/frontend
npm install
npm run dev -- --port 3000 --host
```

---

### Method 3: Containerized Launch (Docker Compose)
```bash
cd ~/Desktop/baghewala-digital-twin
docker-compose up --build
```

---

## 📡 API Endpoints & WebSockets

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/field/summary` | Returns aggregated Baghewala Field KPIs (Total BOPD, Steam TPD, cSOR, Power kW). |
| `GET` | `/api/well/{well_id}/telemetry` | Returns complete physics telemetry snapshot for specified well (`BGW-01`, `BGW-04`, etc.). |
| `POST` | `/api/well/{well_id}/control` | Updates interactive well controls (`spm`, `stroke_length_in`, `choke_pct`, `phase`, `anomaly`). |
| `POST` | `/api/well/{well_id}/optimize` | Auto-applies target SPM and choke parameters computed by AI prescriptive engine. |
| `POST` | `/api/chat` | Natural language digital twin assistant query endpoint. |
| `WS` | `/ws/telemetry/{well_id}` | Real-time WebSocket stream pushing fresh telemetry every $1.2\,\text{s}$. |

---

## 🏆 Hackathon Demonstration Story

1. Start with a simulated production well or a fluid-pound fault.
2. Enter market assumptions and evaluate the constrained operating scenarios.
3. Review the selected scenario, its risk flag, and model assumptions before explicitly accepting it.
4. Show the phase gate, dynacard mechanics, and hydraulic pressure context behind the decision.

Any financial uplift shown in the UI is scenario-specific simulated output. Before field use, the team must connect historian data, calibrate model parameters, validate against held-out well tests, and retain human approval in the control path.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for details.
