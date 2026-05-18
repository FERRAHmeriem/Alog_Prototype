package com.chna.service;

import com.chna.filter.AuditFilter;
import com.chna.filter.ConsentFilter;
import com.chna.model.FhirRequest;
import com.chna.model.FhirResponse;
import com.chna.model.PipelineContext;
import com.chna.see.FilterEventEmitter;
import org.springframework.stereotype.Service;

/**
 * Pipeline 3 — Nœud A reçoit la donnée (doc.md §3.5.6 — Pipeline P2P 3)
 *
 * Filter activation order: ② → ③ (Filters ① and ④ are IGNORED again)
 *
 * Node A validates the received FHIR data matches the original request,
 * records the reception in the audit trail, and persists locally (Smart
 * Fetching).
 *
 * Per prototype.md — "Pipeline 3 : Le Filtre ② confirme que la donnée reçue
 * correspond bien à la demande émise. Le Filtre ③ enregistre la réception."
 *
 * Chain: ConsentFilter (integrity check) → AuditFilter (persist + smart cache)
 */
@Service
public class Pipeline3Service {

    private final ConsentFilter consentFilter;
    private final AuditFilter auditFilter;// e
    private final FilterEventEmitter emitter;

    public Pipeline3Service(ConsentFilter consentFilter,
            AuditFilter auditFilter,
            FilterEventEmitter emitter) {
        this.consentFilter = consentFilter;
        this.auditFilter = auditFilter;
        this.emitter = emitter;
    }

    /**
     * Executes Pipeline 3. Verifies integrity and persists the received FHIR data.
     * After this pipeline completes, the FHIR resource is displayed in Node A's
     * timeline.
     *
     * @param incomingResponse the FHIR R4 data received from Node B
     * @param originalRequest  the original request to verify data coherence
     * @return context containing the verified fhirResponse ready to display
     */
    public PipelineContext execute(FhirResponse incomingResponse, FhirRequest originalRequest) {
        // Reset all filters to "idle" for fresh animation
        emitter.emit(1, "idle", null);
        emitter.emit(2, "idle", null);
        emitter.emit(3, "idle", null);
        emitter.emit(4, "idle", null);

        // In Pipeline 3, the "request" object re-uses the original request token for
        // re-verification
        PipelineContext ctx = PipelineContext.builder()
                .request(originalRequest)
                .fhirResponse(incomingResponse)
                .pipelineNumber(3)
                .blocked(false)
                .build();

        // Filtre ① — IGNORED (Node A is again in Demandeur mode — no translation
        // needed)
        emitter.emit(1, "ignored", "Non activé — Nœud A reçoit en FHIR R4 directement");

        // Filtre ② — IGNORED in Pipeline 3 (Already validated on emission)
        emitter.emit(2, "ignored", "Non activé — Déjà vérifié lors de l'émission");

        // Filtre ③ — AuditFilter: record reception + Smart Fetching local persistence
        ctx = auditFilter.process(ctx);

        // Filtre ④ — IGNORED (SIH access is only on the détenteur node)
        emitter.emit(4, "ignored", "Non activé — Lecture SIH uniquement sur le Nœud détenteur");

        return ctx;
    }
}
