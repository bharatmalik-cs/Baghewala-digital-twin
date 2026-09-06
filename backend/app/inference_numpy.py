"""
inference_numpy.py

Pure NumPy forward-pass implementation of trained MLP neural networks
(margin_regressor.json and risk_classifier.json). Zero scikit-learn dependency.
"""

import os
import json
import math
import numpy as np
from typing import Dict, Any, List, Tuple


def relu(x: np.ndarray) -> np.ndarray:
    return np.maximum(0, x)


def softmax(x: np.ndarray) -> np.ndarray:
    max_val = np.max(x, axis=-1, keepdims=True)
    exps = np.exp(x - max_val)
    return exps / np.sum(exps, axis=-1, keepdims=True)


class MLPFromJSON:
    """
    Evaluates JSON-exported MLPRegressor or MLPClassifier weights using pure NumPy.
    """
    def __init__(self, spec_or_path):
        if isinstance(spec_or_path, str):
            with open(spec_or_path, "r") as f:
                spec = json.load(f)
        else:
            spec = spec_or_path

        self.weights = [np.array(w, dtype=np.float64) for w in spec["weights"]]
        self.biases = [np.array(b, dtype=np.float64) for b in spec["biases"]]
        self.scaler_mean = np.array(spec["scaler_mean"], dtype=np.float64)
        self.scaler_scale = np.array(spec["scaler_scale"], dtype=np.float64)
        self.out_activation = spec.get("out_activation", "identity")
        self.feature_names = spec.get("feature_names", [])
        self.classes = spec.get("classes", None)

    def _scale(self, x: np.ndarray) -> np.ndarray:
        return (x - self.scaler_mean) / self.scaler_scale

    def predict_raw(self, x: np.ndarray) -> np.ndarray:
        """
        x: 2D numpy array of shape (N, num_features) or 1D array of shape (num_features,)
        """
        is_1d = x.ndim == 1
        if is_1d:
            x = x.reshape(1, -1)

        h = self._scale(x)
        n_layers = len(self.weights)
        for i in range(n_layers):
            h = np.dot(h, self.weights[i]) + self.biases[i]
            if i < n_layers - 1:
                h = relu(h)

        if self.out_activation == "softmax":
            h = softmax(h)

        return h[0] if is_1d else h

    def predict_margin(self, x: np.ndarray) -> np.ndarray:
        """
        Returns predicted $/day margin. If 1D input, returns float scalar. If 2D, returns 1D array.
        """
        raw = self.predict_raw(x)
        if raw.ndim == 1 and raw.shape[0] == 1:
            return float(raw[0])
        elif raw.ndim == 2:
            return raw[:, 0]
        return raw

    def predict_risk(self, x: np.ndarray) -> Tuple[Any, Any]:
        """
        Returns (predicted_labels, probabilities)
        """
        probs = self.predict_raw(x)
        if probs.ndim == 1:
            best_idx = int(np.argmax(probs))
            label = self.classes[best_idx] if self.classes else "NORMAL"
            prob_dict = {c: float(p) for c, p in zip(self.classes, probs)} if self.classes else {}
            return label, prob_dict
        else:
            best_indices = np.argmax(probs, axis=-1)
            labels = [self.classes[i] for i in best_indices] if self.classes else ["NORMAL"] * len(x)
            return labels, probs


_margin_net = None
_risk_net = None


def get_inference_models():
    global _margin_net, _risk_net
    if _margin_net is None:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        margin_path = os.path.join(base_dir, "models", "margin_regressor.json")
        risk_path = os.path.join(base_dir, "models", "risk_classifier.json")

        if not os.path.exists(margin_path):
            margin_path = os.path.join(base_dir, "margin_regressor.json")
        if not os.path.exists(risk_path):
            risk_path = os.path.join(base_dir, "risk_classifier.json")

        if os.path.exists(margin_path):
            _margin_net = MLPFromJSON(margin_path)
        if os.path.exists(risk_path):
            _risk_net = MLPFromJSON(risk_path)

    return _margin_net, _risk_net
