from flask import Flask, request, jsonify
from neural_network import NeuralNet

app = Flask(__name__)
brain = NeuralNet()

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json  # expects {"features": [0, 1]}
    prediction = brain.predict_action(data["features"])
    return jsonify({"prediction": prediction})

@app.route("/train", methods=["POST"])
def train():
    data = request.json  # expects {"features": [0, 1], "label": 1}
    brain.train(data["features"], data["label"])
    return jsonify({"status": "trained"})

if __name__ == "__main__":
    # Render will expose this port automatically
    import os
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
