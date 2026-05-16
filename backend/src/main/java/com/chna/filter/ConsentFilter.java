package com.chna.filter;

import com.chna.mock.AuditStore;
import com.chna.model.AuditEntry;
import com.chna.model.ConsentToken;
import com.chna.model.PipelineContext;
import com.chna.see.FilterEventEmitter;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * Filtre 2 — Sécurité et Contrôle d'Accès (doc.md §3.5.3)
 *
 * Responsibilities:
 *   - Verify the ECDSA consent token attached to every request.
 *   - In Pipeline 1 (Node A): verify token before sending request.
 *   - In Pipeline 2 (Node B): verify token before accessing local SIH.
 *   - In Pipeline 3 (Node A): confirm the received data matches the original request.
 *
 * Real implementation: verify ECDSA P-256 signature against the patient's public key cached locally.
 * Prototype: any token starting with "MOCK_TRUSTED" is accepted (rules.md §5).
 *
 * Tactic: "Authorize Actors" — doc.md §2.3.1
 */
@Component
public class ConsentFilter {

    // Visible delay (ms) so the frontend animation is pedagogically clear
    private static final int PROCESSING_DELAY_MS = 900;

    private final FilterEventEmitter emitter;
    private final AuditStore auditStore;

    public ConsentFilter(FilterEventEmitter emitter, AuditStore auditStore) {
        this.emitter = emitter;
        this.auditStore = auditStore;
    }

    /**
     * Main filter entry point. Emits SSE events as it runs so the frontend
     * visualizer shows the filter transitioning idle → active → done/error.
     *
     * @param ctx the pipeline context to validate
     * @return the same context, enriched with consent token result
     * @throws ConsentException if the token is invalid or revoked
     */
    public PipelineContext process(PipelineContext ctx) {
        // 1. Emit "active" — frontend shows Filter 2 as processing
        emitter.emit(2, "active", "Vérification du jeton de consentement ECDSA...");

        simulateDelay();

        // 2. Perform mock token verification
        String token = ctx.getRequest().getToken();
        boolean valid = token != null && token.startsWith("MOCK_TRUSTED");

        ConsentToken consentToken = ConsentToken.builder()
                .rawToken(token)
                .patientId(ctx.getRequest().getPatientId())
                .issuer("CHNA_SERVICE_CONSENTEMENT")
                .expiresAt(null) // no expiry in mock
                .valid(valid)
                .build();

        ctx.setConsentToken(consentToken);

        if (!valid) {
            // 3a. Token rejected → emit "error" and block the pipeline
            emitter.emit(2, "error", "Jeton de consentement invalide ou révoqué — accès refusé.");
            ctx.setBlocked(true);
            ctx.setBlockReason("Consentement invalide : token = " + token);
            return ctx;
        }

        // 3b. Token accepted → generate audit entry and emit "done"
        AuditEntry entry = AuditEntry.builder()
                .timestamp(Instant.now().toString())
                .noeud(ctx.getPipelineNumber() == 2 ? "Noeud B" : "Noeud A")
                .filterId(2)
                .pipeline(ctx.getPipelineNumber())
                .action("Filtre 2 — Consentement OK | Jeton ECDSA valide pour " + ctx.getRequest().getPatientId())
                .patientId(ctx.getRequest().getPatientId())
                .build();

        auditStore.add(entry);
        emitter.emit(2, "done", entry);

        return ctx;
    }

    private void simulateDelay() {
        try {
            Thread.sleep(PROCESSING_DELAY_MS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
