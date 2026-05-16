package com.chna.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents the consent token verified by Filter 2 (Sécurité & Contrôle d'Accès).
 * In the real system, this token is ECDSA P-256 signed (doc.md §3.3.2 — Service Consentement).
 * In this prototype, verification is mocked: any token starting with "MOCK_TRUSTED" is valid.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ConsentToken {
    /** The raw token string (mocked ECDSA signature) */
    private String rawToken;

    /** National patient identifier the token was issued for */
    private String patientId;

    /** Issuing authority (mocked: "CHNA_SERVICE_CONSENTEMENT") */
    private String issuer;

    /** ISO-8601 expiry — null means valid indefinitely in mock mode */
    private String expiresAt;

    /** Whether this token passed Filter 2 verification */
    private boolean valid;
}