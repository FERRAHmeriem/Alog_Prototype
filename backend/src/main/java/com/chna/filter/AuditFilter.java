package com.chna.filter;

import com.chna.mock.AuditStore;
import com.chna.model.AuditEntry;
import com.chna.model.PipelineContext;
import com.chna.see.FilterEventEmitter;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * Filtre 3 — Logique Métier, Smart Cache et Audit Trail (doc.md §3.5.4)
 *
 * Responsibilities:
 *   - Record every access as a non-repudiable audit entry (Maintain Audit Trail tactic, doc.md §2.3.1).
 *   - In Pipeline 3 (Node A receive): persist the received FHIR data locally (Smart Fetching).
 *
 * Tactic: "Maintain Audit Trail" — if this filter fails, the pipeline must be blocked.
 * Tactic: "Smart Fetching / Persistance Locale" (doc.md §2.3.3 — Disponibilité)
 *
 * Real implementation: ACID write to both the business table and the OUTBOX table
 * in the same transaction (doc.md §3.5.4 — Transactional Outbox Pattern).
 * Prototype: stores to the in-memory AuditStore.
 */
@Component
public class AuditFilter {

    private static final int PROCESSING_DELAY_MS = 600;

    private final FilterEventEmitter emitter;
    private final AuditStore auditStore;

    public AuditFilter(FilterEventEmitter emitter, AuditStore auditStore) {
        this.emitter = emitter;
        this.auditStore = auditStore;
    }

    /**
     * Records the current pipeline step in the audit trail.
     * Determines the action description based on pipeline number and emits SSE events.
     *
     * @param ctx the current pipeline context
     * @return the same context, unchanged (audit is a side effect)
     */
    public PipelineContext process(PipelineContext ctx) {
        // 1. Emit "active" so the frontend shows Filter 3 is running
        emitter.emit(3, "active", "Enregistrement dans l'Audit Trail...");

        simulateDelay();

        // 2. Build the audit entry with pipeline-specific action description
        String action = buildActionDescription(ctx);
        AuditEntry entry = AuditEntry.builder()
                .timestamp(Instant.now().toString())
                .noeud(ctx.getPipelineNumber() == 2 ? "Noeud B" : "Noeud A")
                .filterId(3)
                .pipeline(ctx.getPipelineNumber())
                .action(action)
                .patientId(ctx.getRequest().getPatientId())
                .build();

        auditStore.add(entry);

        // 3. If Pipeline 3 (Node A receiving data): simulate Smart Fetching persistence
        if (ctx.getPipelineNumber() == 3 && ctx.getFhirResponse() != null) {
            emitter.emit(3, "active", "Persistance Smart Fetching — données chiffrées AES-256 en cache local...");
            simulateDelay();
        }

        // 4. Emit "done" with the audit entry as payload (frontend renders it in the sidebar)
        emitter.emit(3, "done", entry);

        return ctx;
    }

    private String buildActionDescription(PipelineContext ctx) {
        return switch (ctx.getPipelineNumber()) {
            case 1 -> "Filtre 3 - Audit Trail OK | Demande enregistree pour patient " +
                      ctx.getRequest().getPatientId() + " vers Noeud : " + ctx.getRequest().getTargetNode();
            case 2 -> "Filtre 3 - Audit Trail OK | Consultation enregistree par Noeud B - section : " +
                      ctx.getRequest().getSection();
            case 3 -> "Filtre 3 - Smart Fetching OK | Donnee FHIR R4 persistee localement - " +
                      "prochaine consultation depuis le cache (sans reseau)";
            default -> "Filtre 3 - Audit Trail enregistre";
        };
    }

    private void simulateDelay() {
        try {
            Thread.sleep(PROCESSING_DELAY_MS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
