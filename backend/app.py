from flask import Flask, request, jsonify
from neural_network import PetBrain

app = Flask(__name__)
brain = PetBrain()

# -------------------- Predict endpoint --------------------
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    features = data.get("features")
    if features is None:
        return jsonify({"error": "No features provided"}), 400
    try:
        action = brain.predict_action(features)
        return jsonify({"action": action})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -------------------- Train endpoint ----------------------
@app.route("/train", methods=["POST"])
def train():
    data = request.get_json()
    features = data.get("features")
    label = data.get("label")
    if features is None or label is None:
        return jsonify({"error": "Features or label missing"}), 400
    try:
        brain.train(features, label)
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -------------------- Health check -----------------------
@app.route("/", methods=["GET"])
def home():
    return "Pet neural network backend is running!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
