import os
import json
import numpy as np
from typing import Dict, Any, List, Tuple

def relu(vec: np.ndarray) -> np.ndarray:
    return np.maximum(0, vec)

def softmax(vec: np.ndarray) -> np.ndarray:
    max_val = np.max(vec)
    exps = np.exp(vec - max_val)
    return exps / np.sum(exps)

class PyMLPFromJSON:
    def __init__(self, spec: Dict[str, Any]):
        self.weights = [np.array(w) for w in spec["weights"]]
        self.biases = [np.array(b) for b in spec["biases"]]
        self.scaler_mean = np.array(spec["scaler_mean"])
        self.scaler_scale = np.array(spec["scaler_scale"])
        self.out_activation = spec.get("out_activation", "identity")
        self.feature_names = spec.get("feature_names", [])
        self.classes = spec.get("classes", None)

    def _scale(self, x: np.ndarray) -> np.ndarray:
        return (x - self.scaler_mean) / self.scaler_scale

    def predict_raw(self, x: List[float]) -> np.ndarray:
        h = self._scale(np.array(x, dtype=np.float64))
        n_layers = len(self.weights)
        for i in range(n_layers):
            h = np.dot(h, self.weights[i]) + self.biases[i]
            if i < n_layers - 1:
                h = relu(h)
        if self.out_activation == "softmax":
            h = softmax(h)
        return h

    def predict_margin(self, x: List[float]) -> float:
        return float(self.predict_raw(x)[0])

    def predict_risk(self, x: List[float]) -> Tuple[str, Dict[str, float]]:
        probs = self.predict_raw(x)
        best_idx = int(np.argmax(probs))
        prob_dict = {c: float(p) for c, p in zip(self.classes, probs)} if self.classes else {}
        label = self.classes[best_idx] if self.classes else "NORMAL"
        return label, prob_dict

_margin_model = None
_risk_model = None

def get_mlp_models():
    global _margin_model, _risk_model
    if _margin_model is None:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        margin_path = os.path.join(base_dir, "models", "margin_regressor.json")
        risk_path = os.path.join(base_dir, "models", "risk_classifier.json")

        if os.path.exists(margin_path):
            with open(margin_path, "r") as f:
                _margin_model = PyMLPFromJSON(json.load(f))
        if os.path.exists(risk_path):
            with open(risk_path, "r") as f:
                _risk_model = PyMLPFromJSON(json.load(f))

    return _margin_model, _risk_model
