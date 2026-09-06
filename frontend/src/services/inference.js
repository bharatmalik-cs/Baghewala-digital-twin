/**
 * inference.js
 *
 * Pure JavaScript forward-pass for the trained neural networks -- no TensorFlow.js,
 * no ONNX runtime, no dependencies at all beyond reading the JSON weight files.
 * Works identically in Node (backend) or a browser (frontend), since it's just
 * arithmetic on plain arrays.
 */

function relu(vec) {
  return vec.map((v) => Math.max(0, v));
}

function softmax(vec) {
  const max = Math.max(...vec);
  const exps = vec.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / sum);
}

// row-vector (1 x n) times matrix (n x m) -> row-vector (1 x m), plus bias
function matVecPlusBias(vec, matrix, bias) {
  const outDim = matrix[0].length;
  const result = new Array(outDim).fill(0);
  for (let j = 0; j < outDim; j++) {
    let sum = bias[j];
    for (let i = 0; i < vec.length; i++) {
      sum += vec[i] * matrix[i][j];
    }
    result[j] = sum;
  }
  return result;
}

export class MLPFromJSON {
  /**
   * @param {object} spec - the parsed JSON (margin_regressor.json or risk_classifier.json)
   */
  constructor(spec) {
    this.weights = spec.weights;         // array of [in_dim][out_dim] matrices
    this.biases = spec.biases;           // array of [out_dim] vectors
    this.scalerMean = spec.scaler_mean;
    this.scalerScale = spec.scaler_scale;
    this.outActivation = spec.out_activation; // "identity" or "softmax"
    this.featureNames = spec.feature_names;
    this.classes = spec.classes || null; // only present for classifiers
  }

  _scale(x) {
    return x.map((v, i) => (v - this.scalerMean[i]) / this.scalerScale[i]);
  }

  /** Raw forward pass. x: plain array of feature values in ORIGINAL (unscaled) units. */
  predictRaw(x) {
    let h = this._scale(x);
    const nLayers = this.weights.length;
    for (let i = 0; i < nLayers; i++) {
      h = matVecPlusBias(h, this.weights[i], this.biases[i]);
      if (i < nLayers - 1) h = relu(h); // hidden layers use ReLU
    }
    if (this.outActivation === "softmax") h = softmax(h);
    return h;
  }

  /** For the regressor: returns a single predicted $/day margin. */
  predictMargin(x) {
    return this.predictRaw(x)[0];
  }

  /** For the classifier: returns { label, probabilities }. */
  predictRisk(x) {
    const probs = this.predictRaw(x);
    let bestIdx = 0;
    for (let i = 1; i < probs.length; i++) if (probs[i] > probs[bestIdx]) bestIdx = i;
    const probByClass = {};
    if (this.classes) {
      this.classes.forEach((c, i) => (probByClass[c] = probs[i]));
    }
    return { label: this.classes ? this.classes[bestIdx] : "NORMAL", probabilities: probByClass };
  }
}
