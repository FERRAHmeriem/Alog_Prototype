# noeud_b/filtre_3_audit.py
import sqlite3, datetime

def initialiser():
    conn = sqlite3.connect("audit.db")
    conn.execute("""CREATE TABLE IF NOT EXISTS audit (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT, action TEXT,
        patient_id TEXT, section_id TEXT,
        noeud_demandeur TEXT, statut TEXT
    )""")
    conn.commit()
    conn.close()

def enregistrer(action, patient_id, section_id, noeud_demandeur, statut):
    conn = sqlite3.connect("audit.db")
    conn.execute(
        "INSERT INTO audit VALUES (NULL,?,?,?,?,?,?)",
        (datetime.datetime.utcnow().isoformat(),
         action, patient_id, section_id, noeud_demandeur, statut)
    )
    conn.commit()
    conn.close()