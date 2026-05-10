# noeud_b/filtre_2_consentement.py
import jwt

CLE_PUBLIQUE = "secret_noyau"
jetons_consommes = set()  # en vrai : base de données

def verifier_jeton(jeton: str, noeud_b_id: str) -> dict:
    try:
        payload = jwt.decode(jeton, CLE_PUBLIQUE, algorithms=["HS256"])
        
        if payload["jti"] in jetons_consommes:
            raise Exception("Jeton déjà consommé — tentative de rejeu")
        
        if payload["noeudB"] != noeud_b_id:
            raise Exception("Jeton non destiné à ce nœud")
        
        jetons_consommes.add(payload["jti"])
        return payload
    
    except jwt.ExpiredSignatureError:
        raise Exception("Jeton expiré")
    except jwt.InvalidTokenError:
        raise Exception("Jeton invalide")