import numpy as np
from sklearn.linear_model import SGDClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
import joblib
from pathlib import Path

MODEL_PATH = Path("pet_model.pkl")

class PetBrain:
    def __init__(self):
        if MODEL_PATH.exists():
            self.model = joblib.load(MODEL_PATH)
        else:
            self.model = make_pipeline(
                StandardScaler(),
                SGDClassifier(loss="log_loss")
            )
            X = np.array([[0, 0], [1, 1]])
            y = np.array([0, 1])
            self.model.partial_fit(X, y, classes=np.array([0, 1]))

    def predict_action(self, features):
        return int(self.model.predict([features])[0])

    def train(self, features, label):
        self.model.partial_fit([features], [label])
        joblib.dump(self.model, MODEL_PATH)
