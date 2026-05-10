# noeud_a/main.py
from fastapi import FastAPI
import httpx

app = FastAPI()
NOYAU_URL = "http://localhost:8000"
NOEUD_B_URL = "http://localhost:8002"

@app.get("/demander-section")
async def demander_section(patient_id: str, section_id: str):
    
    # Étape 1 : demander le consentement au noyau
    async with httpx.AsyncClient() as client:
        rep = await client.post(f"{NOYAU_URL}/consent/request", json={
            "patientId": patient_id,
            "sectionId": section_id,
            "noeudA": "EHU-SBA",
            "noeudB": "CLINIQUE-SBA"
        })
    
    # Étape 2 : simuler l'approbation du patient
    async with httpx.AsyncClient() as client:
        rep = await client.post(f"{NOYAU_URL}/consent/approve", json={
            "patientId": patient_id,
            "sectionId": section_id,
            "noeudA": "EHU-SBA",
            "noeudB": "CLINIQUE-SBA"
        })
    jeton = rep.json()["jeton"]
    
    # Étape 3 : envoyer la requête FHIR R4 au nœud B
    # La requête est déjà en FHIR R4 — pas besoin d'adaptateur
    async with httpx.AsyncClient() as client:
        rep = await client.post(
            f"{NOEUD_B_URL}/recevoir",
            json={
                "resourceType": "Task",
                "patientId": patient_id,
                "sectionId": section_id
            },
            headers={"authorization": f"Bearer {jeton}"}
        )
    
    return rep.json()
@app.get("/audit")
def voir_audit():
    try:
        conn = sqlite3.connect("noeud_b/audit.db")
        rows = conn.execute(
            "SELECT timestamp, action, patient_id, section_id, noeud_demandeur, statut FROM audit ORDER BY id DESC"
        ).fetchall()
        conn.close()
        return [
            {
                "timestamp": r[0],
                "action": r[1],
                "patient_id": r[2],
                "section_id": r[3],
                "noeud_demandeur": r[4],
                "statut": r[5]
            }
            for r in rows
        ]
    except Exception as e:
        return {"erreur": str(e)}