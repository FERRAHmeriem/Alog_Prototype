package com.chna.service;

import com.chna.filter.AuditFilter;
import com.chna.filter.ConsentFilter;
import com.chna.model.FhirRequest;
import com.chna.model.PipelineContext;
import com.chna.see.FilterEventEmitter;
import org.springframework.stereotype.Service;

/**
 * Pipeline 1 — Nœud A émet la demande (doc.md §3.5.6 — Pipeline P2P 1)
 *
 * Filter activation order: ② → ③   (Filters ① and ④ are IGNORED)
 *
 * The Node A interface generates the request natively in FHIR R4.
 * This pipeline verifies consent and records the outgoing request in the audit trail.
 * The FHIR translation filters are deliberately NOT activated (see doc.md §3.5.1 — Dual Mode Demandeur).
 *
 * Chain: ConsentFilter → AuditFilter → (emit "ignored" for filters 1 & 4)
 */
@Service
public class Pipeline1Service {

    private final ConsentFilter consentFilter;
    private final AuditFilter auditFilter;
    private final FilterEventEmitter emitter;

    public Pipeline1Service(ConsentFilter consentFilter,
                            AuditFilter auditFilter,
                            FilterEventEmitter emitter) {
        this.consentFilter = consentFilter;
        this.auditFilter = auditFilter;
        this.emitter = emitter;
    }

    /**
     * Executes Pipeline 1 synchronously, emitting SSE filter-update events at each step.
     * The frontend SSE listener will animate the visualizer in real-time.
     *
     * @param request the FHIR R4 request from Node A
     * @return the enriched pipeline context (contains consent token + audit trace)
     */
    public PipelineContext execute(FhirRequest request) {
        // Reset all filters to "idle" at pipeline start (clean slate for the visualizer)
        emitter.emit(1, "idle", null);
        emitter.emit(2, "idle", null);
        emitter.emit(3, "idle", null);
        emitter.emit(4, "idle", null);

        PipelineContext ctx = PipelineContext.builder()
                .request(request)
                .pipelineNumber(1)
                .blocked(false)
                .build();

        // Filtre ① — IGNORED in Pipeline 1 (Node A generates FHIR natively)
        emitter.emit(1, "ignored", "Non activé — Nœud A génère nativement en FHIR R4");

        // Filtre ② — ConsentFilter: verify the ECDSA token
        ctx = consentFilter.process(ctx);
        if (ctx.isBlocked()) return ctx;

        // Filtre ③ — AuditFilter: record the outgoing request
        ctx = auditFilter.process(ctx);

        // Filtre ④ — IGNORED in Pipeline 1 (SIH access only happens on the détenteur node)
        emitter.emit(4, "ignored", "Non activé — Nœud A est demandeur, pas détenteur");

        return ctx;
    }
}
