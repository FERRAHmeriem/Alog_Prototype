# noyau_central/main.py
from fastapi import FastAPI
import jwt, datetime

app = FastAPI()
CLE_PRIVEE = "secret_noyau"  # en vrai ce serait RSA

@app.post("/consent/request")
def demander_consentement(data: dict):
    # Simule la notification au patient
    # En vrai : envoie une notification push
    return {"status": "en_attente", "demande_id": "DEM-001"}

@app.post("/consent/approve")
def approuver(data: dict):
    # Simule l'approbation du patient (bouton dans l'interface)
    jeton = jwt.encode({
        "patientId": data["patientId"],
        "sectionId": data["sectionId"],
        "noeudA": data["noeudA"],
        "noeudB": data["noeudB"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=5),
        "jti": "uuid-unique-001"
    }, CLE_PRIVEE, algorithm="HS256")
    return {"jeton": jeton}