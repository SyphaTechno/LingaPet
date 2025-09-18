from pets import Pet
from neural_network import PetBrain

brain = PetBrain()
user_features = [3, 1]
predicted_action = brain.predict_action(user_features)
actions = ["jump around", "take a nap"]
print(f"Predicted action: {actions[predicted_action]}")

pet1 = Pet("rabbit","Bunny")
pet2 = Pet("parrot","Polly")
print(pet1.auto_chat())
print(pet2.auto_chat())

brain.train(user_features, label=1)
