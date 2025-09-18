PETS = { "rabbit":"🐇", "parrot":"🦜", "horse":"🐎" }

class Pet:
    def __init__(self, pet_type, name):
        self.pet_type = pet_type
        self.name = name
        self.emoji = PETS.get(pet_type,"❓")

    def auto_chat(self):
        return f"{self.emoji} {self.name} says hello!"
