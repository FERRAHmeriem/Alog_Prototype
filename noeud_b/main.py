# noeud_b/main.py
from fastapi import FastAPI, HTTPException, Header
from .filtre_1_adaptateur import xml_vers_fhir   # ← add the dot
from .filtre_2_consentement import verifier_jeton  # ← add the dot
from .filtre_3_audit import enregistrer, initialiser  # ← add the dot
from .sih_local import recuperer_section, initialiser as init_sih  # ← add the dot
import sqlite3    
app = FastAPI()
initialiser()
init_sih()

@app.post("/recevoir")
def recevoir(message: dict, authorization: str = Header(None)):
    
    # ROUTEUR — lit le resourceType
    resource_type = message.get("resourceType")
    
    if resource_type == "Task":
        # Pipeline 2 — demande entrante
        return pipeline_demande(message, authorization)
    
    else:
        raise HTTPException(400, "Type de message non reconnu")

def pipeline_demande(message: dict, authorization: str):
    jeton_brut = authorization.replace("Bearer ", "")
    patient_id = message["patientId"]
    section_id = message["sectionId"]
    
    # Filtre ② — Vérification consentement
    try:
        payload = verifier_jeton(jeton_brut, "CLINIQUE-SBA")
    except Exception as e:
        enregistrer("ACCES_REFUSE", patient_id, section_id, "INCONNU", str(e))
        raise HTTPException(401, f"Accès refusé : {e}")
    
    # Filtre ③ — Audit trail
    enregistrer("SECTION_CONSULTEE", patient_id, section_id,
                payload["noeudA"], "SUCCES")
    
    # Filtre ④ — Récupération depuis SIH local
    contenu_xml = recuperer_section(patient_id, section_id)
    if not contenu_xml:
        raise HTTPException(404, "Section non trouvée")
    
    # Filtre ① — Transformation vers FHIR R4
    donnee_fhir = xml_vers_fhir(contenu_xml, patient_id, section_id)
    
    return donnee_fhir

@app.get("/audit")
def voir_audit():
    conn = sqlite3.connect("audit.db")
    rows = conn.execute(
        "SELECT timestamp, action, patient_id, section_id, noeud_demandeur, statut FROM audit ORDER BY id DESC"
    ).fetchall()
    conn.close()
    return [
        {"timestamp": r[0], "action": r[1], "patient_id": r[2],
         "section_id": r[3], "noeud_demandeur": r[4], "statut": r[5]}
        for r in rows
    ]