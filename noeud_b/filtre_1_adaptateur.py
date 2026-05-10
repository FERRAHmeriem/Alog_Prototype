# noeud_b/filtre_1_adaptateur.py
import xml.etree.ElementTree as ET

def xml_vers_fhir(xml_brut: str, patient_id: str, section_id: str) -> dict:
    root = ET.fromstring(xml_brut)
    return {
        "resourceType": "DiagnosticReport",
        "id": section_id,
        "subject": {"reference": f"Patient/{patient_id}"},
        "conclusion": root.find("Resultat").text,
        "status": "final"
    }