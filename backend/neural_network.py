import numpy as np
from sklearn.linear_model import SGDClassifier
from sklearn.preprocessing import StandardScaler
import joblib
from pathlib import Path

MODEL_PATH = Path("pet_model.pkl")

class PetBrain:
    def __init__(self):
        if MODEL_PATH.exists():
            saved = joblib.load(MODEL_PATH)
            self.scaler = saved["scaler"]
            self.clf = saved["clf"]
        else:
            # Initialize scaler and classifier
            self.scaler = StandardScaler()
            self.clf = SGDClassifier(loss="log_loss")
            
            # Dummy initial data
            X = np.array([[0, 0], [1, 1]])
            y = np.array([0, 1])
            self.scaler.fit(X)
            self.clf.partial_fit(self.scaler.transform(X), y, classes=np.array([0, 1]))
            self.save_model()

    def save_model(self):
        joblib.dump({"scaler": self.scaler, "clf": self.clf}, MODEL_PATH)

    def predict_action(self, features):
        X = np.array([features])
        X_scaled = self.scaler.transform(X)
        return int(self.clf.predict(X_scaled)[0])

    def train(self, features, label):
        X = np.array([features])
        X_scaled = self.scaler.transform(X)
        self.clf.partial_fit(X_scaled, [label])
        self.save_model()
