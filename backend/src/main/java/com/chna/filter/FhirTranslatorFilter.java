package com.chna.filter;

import com.chna.mock.AuditStore;
import com.chna.mock.SihMockData;
import com.chna.model.AuditEntry;
import com.chna.model.FhirResponse;
import com.chna.model.PipelineContext;
import com.chna.see.FilterEventEmitter;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * Filtre 1 — Adaptateur FHIR (Anti-Corruption Layer, doc.md §3.5.2)
 *
 * ACTIVE ONLY in Pipeline 2 (Node B — Détenteur mode).
 * IGNORED (marked as such) in Pipelines 1 and 3.
 *
 * Responsibilities:
 *   - Translate the raw proprietary SIH record (produced by Filter 4) into a FHIR R4 resource.
 *   - Validate that all critical FHIR fields are present before allowing transmission.
 *
 * This is the Anti-Corruption Layer: the SIH never knows the CHNA network exists.
 * The translation happens entirely within the node, preserving SIH autonomy (doc.md §3.5.2).
 *
 * Real implementation: HAPI FHIR SDK with a plugin per SIH vendor format.
 * Prototype: translation performed from the SihMockData (in-memory).
 *
 * Tactic: "Tailor Interface / Manage Interfaces" — doc.md §2.3.2
 */
@Component
public class FhirTranslatorFilter {

    private static final int PROCESSING_DELAY_MS = 850;

    private final FilterEventEmitter emitter;
    private final SihMockData sihMockData;
    private final AuditStore auditStore;

    public FhirTranslatorFilter(FilterEventEmitter emitter, SihMockData sihMockData, AuditStore auditStore) {
        this.emitter = emitter;
        this.sihMockData = sihMockData;
        this.auditStore = auditStore;
    }

    /**
     * Translates the raw SIH record in the pipeline context into a standardized FHIR R4 resource.
     * Emits SSE events so the Node B screen can show the before/after transformation.
     *
     * @param ctx context containing the rawSihRecord from Filter 4
     * @return context enriched with fhirResponse
     */
    public PipelineContext process(PipelineContext ctx) {
        // 1. Emit "active" — frontend shows Filter 1 animating (the ACL is running)
        emitter.emit(1, "active",
                "Anti-Corruption Layer — Traduction " + ctx.getRequest().getSection() + " → FHIR R4...");

        simulateDelay();

        // 2. Perform translation using mock data
        // In production: the Plugin Architecture detects SIH format and applies the correct adapter
        FhirResponse fhirResponse = sihMockData.getTranslatedFhirResponse(ctx.getRequest().getPatientId());
        ctx.setFhirResponse(fhirResponse);

        // 3. Generate audit entry for the translation step
        AuditEntry entry = AuditEntry.builder()
                .timestamp(Instant.now().toString())
                .noeud("Noeud B")
                .filterId(1)
                .pipeline(ctx.getPipelineNumber())
                .action("Filtre 1 — ACL FHIR OK | Traduction vers FHIR R4 validee " +
                        "| ResourceType : " + fhirResponse.getResourceType() + " | Code LOINC : " + fhirResponse.getCode())
                .patientId(ctx.getRequest().getPatientId())
                .build();

        auditStore.add(entry);

        // 4a. Emit data payload — Node B panel shows the FHIR R4 output
        emitter.emit(1, "done", fhirResponse);
        
        // 4b. Emit audit entry so it appears in ALL windows' audit sidebars
        emitter.emit(1, "audit", entry);

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
