package com.chna.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Mutable context object that carries state through the pipeline steps.
 * Each filter enriches this context with its output before passing it downstream.
 *
 * This is the "pipe" in the Pipe & Filter pattern (doc.md §3.5.1):
 * filters communicate by reading/writing to this shared context object.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PipelineContext {
    /** The original request from Node A */
    private FhirRequest request;

    /** The validated consent token (set by Filter 2) */
    private ConsentToken consentToken;

    /** Raw SIH data extracted by Filter 4 (only active in Pipeline 2) */
    private SihRecord rawSihRecord;

    /** Translated FHIR R4 resource produced by Filter 1 (only in Pipeline 2) */
    private FhirResponse fhirResponse;

    /** Set to true by Filter 2 if consent check fails (pipeline is halted) */
    private boolean blocked;

    /** Human-readable reason if blocked */
    private String blockReason;

    /** Which pipeline number (1, 2, or 3) this context is running in */
    private int pipelineNumber;
}
