import os
import json
import numpy as np
from sklearn.neural_network import MLPRegressor, MLPClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import LabelEncoder

from app.physics.css_model import CSSModel
from app.physics.srp_model import SRPModel
from app.physics.hydraulics import HydraulicsModel
from app.optimizer import WellOptimizer

def generate_synthetic_dataset(num_samples=1200):
    optimizer = WellOptimizer()
    X = []
    y_margin = []
    y_risk = []
    anomalies = ["NORMAL", "FLUID_POUND", "GAS_LOCK", "VISCOUS_DRAG"]

    np.random.seed(42)
    for _ in range(num_samples):
        visc = float(np.random.uniform(30.0, 9500.0))
        soak_factor = float(np.random.uniform(0.1, 1.0))
        res_press = float(np.random.uniform(85.0, 135.0))
        spm = float(np.random.uniform(0.0, 9.5))
        choke = float(np.random.uniform(30.0, 95.0))
        steam = float(np.random.uniform(0.0, 140.0))
        anomaly = np.random.choice(anomalies)

        capacity_factor = (spm / 6.0) * (choke / 75.0)
        fillage = 92.0 if anomaly == "NORMAL" else (62.0 if anomaly == "FLUID_POUND" else 85.0)
        oil_bopd = max(0.0, 120.0 * capacity_factor * (fillage / 100.0))
        power_kw = max(0.0, 42.0 * ((spm / max(0.1, spm)) ** 1.35))

        margin = optimizer.evaluate_objective(
            oil_bopd=oil_bopd,
            steam_tpd=steam,
            power_kw=power_kw,
            crude_price_usd_bbl=75.0,
            steam_cost_usd_ton=18.0,
            electricity_cost_usd_kwh=0.12,
            anomaly_type=anomaly
        )

        X.append([visc, soak_factor, res_press, spm, choke, steam])
        y_margin.append(margin)
        y_risk.append(anomaly)

    return np.array(X), np.array(y_margin), np.array(y_risk)

def mlp_to_dict(mlp, scaler, feature_names, extra=None):
    d = {
        "layer_sizes": [w.shape[0] for w in mlp.coefs_] + [mlp.coefs_[-1].shape[1]],
        "weights": [w.tolist() for w in mlp.coefs_],
        "biases": [b.tolist() for b in mlp.intercepts_],
        "activation": mlp.activation,
        "out_activation": getattr(mlp, "out_activation_", "identity"),
        "scaler_mean": scaler.mean_.tolist(),
        "scaler_scale": scaler.scale_.tolist(),
        "feature_names": feature_names
    }
    if extra:
        d.update(extra)
    return d

def main():
    X, y_margin, y_risk = generate_synthetic_dataset()

    feature_names = [
        "dead_oil_viscosity_cp", "soak_heat_factor", "reservoir_pressure_bar",
        "spm", "choke_pct", "steam_tpd"
    ]

    scaler_margin = StandardScaler()
    X_scaled_m = scaler_margin.fit_transform(X)
    mlp_margin = MLPRegressor(hidden_layer_sizes=(64, 32, 16), max_iter=300, random_state=42)
    mlp_margin.fit(X_scaled_m, y_margin)

    scaler_risk = StandardScaler()
    X_scaled_r = scaler_risk.fit_transform(X)
    le = LabelEncoder()
    y_risk_encoded = le.fit_transform(y_risk)
    mlp_risk = MLPClassifier(hidden_layer_sizes=(64, 32, 16), max_iter=300, random_state=42)
    mlp_risk.fit(X_scaled_r, y_risk_encoded)

    margin_json = mlp_to_dict(mlp_margin, scaler_margin, feature_names)
    risk_json = mlp_to_dict(mlp_risk, scaler_risk, feature_names, extra={"classes": le.classes_.tolist()})

    # Root directory of the repository
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    backend_models_dir = os.path.join(root_dir, "backend", "app", "models")
    frontend_models_dir = os.path.join(root_dir, "frontend", "src", "models")

    os.makedirs(backend_models_dir, exist_ok=True)
    os.makedirs(frontend_models_dir, exist_ok=True)

    with open(os.path.join(backend_models_dir, "margin_regressor.json"), "w") as f:
        json.dump(margin_json, f, indent=2)
    with open(os.path.join(frontend_models_dir, "margin_regressor.json"), "w") as f:
        json.dump(margin_json, f, indent=2)

    with open(os.path.join(backend_models_dir, "risk_classifier.json"), "w") as f:
        json.dump(risk_json, f, indent=2)
    with open(os.path.join(frontend_models_dir, "risk_classifier.json"), "w") as f:
        json.dump(risk_json, f, indent=2)

    # Cleanup any accidental nested folders
    os.system(f"rm -rf {os.path.join(root_dir, 'backend', 'backend')} {os.path.join(root_dir, 'backend', 'frontend')}")

    print("Fast training & JSON export completed successfully!")

if __name__ == "__main__":
    main()
