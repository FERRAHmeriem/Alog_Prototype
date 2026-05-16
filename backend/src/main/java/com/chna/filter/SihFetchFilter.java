package com.chna.filter;

import com.chna.mock.AuditStore;
import com.chna.mock.SihMockData;
import com.chna.model.AuditEntry;
import com.chna.model.PipelineContext;
import com.chna.model.SihRecord;
import com.chna.see.FilterEventEmitter;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * Filtre 4 — Interface SIH et Stockage Local (doc.md §3.5.5)
 *
 * ACTIVE ONLY in Pipeline 2 (Node B — Détenteur mode).
 * IGNORED (marked as such) in Pipelines 1 and 3.
 *
 * Responsibilities:
 *   - Access the local SIH database in READ-ONLY mode to retrieve patient data.
 *   - Extract the raw proprietary-format record identified by the request section.
 *   - Each access generates an immutable audit entry (tactic: "Maintain Audit Trail").
 *
 * Tactic: "Limit access / Limit exposure" — the SIH interface is read-only, never writes.
 *
 * Real implementation: executes a parameterized read-only SQL query against the local PostgreSQL.
 * Prototype: returns data from SihMockData (in-memory).
 */
@Component
public class SihFetchFilter {

    private static final int PROCESSING_DELAY_MS = 1000;

    private final FilterEventEmitter emitter;
    private final SihMockData sihMockData;
    private final AuditStore auditStore;

    public SihFetchFilter(FilterEventEmitter emitter, SihMockData sihMockData, AuditStore auditStore) {
        this.emitter = emitter;
        this.sihMockData = sihMockData;
        this.auditStore = auditStore;
    }

    /**
     * Fetches the raw proprietary record from Node B's local SIH mock.
     * Enriches the context with the SihRecord so Filter 1 can translate it.
     *
     * @param ctx the pipeline context (must have request.section set)
     * @return context enriched with rawSihRecord
     */
    public PipelineContext process(PipelineContext ctx) {
        // 1. Emit "active" — the frontend shows Filter 4 lighting up on Node B
        emitter.emit(4, "active", "Accès SIH local (lecture seule) — table : " +
                     ctx.getRequest().getSection() + "...");

        simulateDelay();

        // 2. Fetch from in-memory mock (represents read-only SQL access in production)
        SihRecord rawRecord = sihMockData.getRawRecord();
        ctx.setRawSihRecord(rawRecord);

        // 3. Generate audit entry for this SIH access (every access is audited — doc.md §3.5.5)
        AuditEntry entry = AuditEntry.builder()
                .timestamp(Instant.now().toString())
                .noeud("Noeud B")
                .filterId(4)
                .pipeline(ctx.getPipelineNumber())
                .action("Filtre 4 — Lecture SIH OK | Donnees brutes extraites — table " +
                        rawRecord.getTableName() + " | ref interne : " + rawRecord.getInternalId())
                .patientId(ctx.getRequest().getPatientId())
                .build();

        auditStore.add(entry);

        // 4a. Emit data payload — Node B panel shows proprietary raw data
        emitter.emit(4, "done", rawRecord);
        
        // 4b. Emit audit entry separately so it appears in ALL windows' audit sidebars
        emitter.emit(4, "audit", entry);

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
