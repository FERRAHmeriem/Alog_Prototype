# noeud_b/sih_local.py
import sqlite3

def initialiser():
    conn = sqlite3.connect("sih_local.db")
    conn.execute("""CREATE TABLE IF NOT EXISTS sections (
        id TEXT, patient_id TEXT, type TEXT, contenu TEXT
    )""")
    conn.execute("""INSERT OR IGNORE INTO sections VALUES 
        ('IRM-2024-03', 'PAT-7821', 'IRM', 
        '<Rapport><Patient>Samy</Patient><Resultat>Normal</Resultat></Rapport>')
    """)
    conn.commit()
    conn.close()

def recuperer_section(patient_id, section_id):
    conn = sqlite3.connect("sih_local.db")
    row = conn.execute(
        "SELECT contenu FROM sections WHERE patient_id=? AND id=?",
        (patient_id, section_id)
    ).fetchone()
    conn.close()
    return row[0] if row else None