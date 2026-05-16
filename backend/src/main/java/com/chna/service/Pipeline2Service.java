package com.chna.service;

import com.chna.filter.AuditFilter;
import com.chna.filter.ConsentFilter;
import com.chna.filter.FhirTranslatorFilter;
import com.chna.filter.SihFetchFilter;
import com.chna.model.FhirRequest;
import com.chna.model.PipelineContext;
import com.chna.see.FilterEventEmitter;
import org.springframework.stereotype.Service;

/**
 * Pipeline 2 — Nœud B reçoit la demande et répond (doc.md §3.5.6 — Pipeline P2P 2)
 *
 * Filter activation order: ② → ③ → ④ → ①   (ALL filters active)
 *
 * This is the most pedagogically important pipeline.
 * All 4 filters activate here — this is the only pipeline that shows the Anti-Corruption Layer.
 * An observer can see: raw SIH data (Filter ④ output) → FHIR R4 data (Filter ① output).
 *
 * Per doc.md §3.5.1 — "C'est le seul pipeline où les filtres ① et ④ s'activent,
 * et uniquement sur le nœud qui détient la donnée."
 *
 * Chain: ConsentFilter → AuditFilter → SihFetchFilter → FhirTranslatorFilter
 */
@Service
public class Pipeline2Service {

    private final ConsentFilter consentFilter;
    private final AuditFilter auditFilter;
    private final SihFetchFilter sihFetchFilter;
    private final FhirTranslatorFilter fhirTranslatorFilter;
    private final FilterEventEmitter emitter;

    public Pipeline2Service(ConsentFilter consentFilter,
                            AuditFilter auditFilter,
                            SihFetchFilter sihFetchFilter,
                            FhirTranslatorFilter fhirTranslatorFilter,
                            FilterEventEmitter emitter) {
        this.consentFilter = consentFilter;
        this.auditFilter = auditFilter;
        this.sihFetchFilter = sihFetchFilter;
        this.fhirTranslatorFilter = fhirTranslatorFilter;
        this.emitter = emitter;
    }

    /**
     * Executes Pipeline 2 synchronously. All 4 filters activate in order.
     * This is the core of the interoperability demonstration.
     *
     * @param request the incoming FHIR R4 request from Node A (via the P2P channel)
     * @return context containing both rawSihRecord (before) and fhirResponse (after) for the diff view
     */
    public PipelineContext execute(FhirRequest request) {
        // Reset all filters to "idle" for this pipeline's fresh animation
        emitter.emit(1, "idle", null);
        emitter.emit(2, "idle", null);
        emitter.emit(3, "idle", null);
        emitter.emit(4, "idle", null);

        PipelineContext ctx = PipelineContext.builder()
                .request(request)
                .pipelineNumber(2)
                .blocked(false)
                .build();

        // Filtre ② — ConsentFilter: Node B verifies the token before any SIH access
        ctx = consentFilter.process(ctx);
        if (ctx.isBlocked()) return ctx;

        // Filtre ③ — AuditFilter: Node B records that this consultation occurred
        ctx = auditFilter.process(ctx);

        // Filtre ④ — SihFetchFilter: reads local SIH in proprietary format (READ-ONLY)
        ctx = sihFetchFilter.process(ctx);

        // Filtre ① — FhirTranslatorFilter: Anti-Corruption Layer translates to FHIR R4
        ctx = fhirTranslatorFilter.process(ctx);

        return ctx;
    }
}
