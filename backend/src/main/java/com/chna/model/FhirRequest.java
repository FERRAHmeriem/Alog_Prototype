package com.chna.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payload that Node A (requester) sends when initiating Pipeline 1.
 * The interface generates this natively in FHIR R4 format (doc.md §3.5.1 — Dual Mode Demandeur).
 * The token is a mocked ECDSA consent token (doc.md §3.5.3 — Filter 2).
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FhirRequest {
    /** National patient identifier, e.g. "DZ-2019-00442" */
    private String patientId;

    /** Mocked ECDSA consent token (see prototype.md — "Jeton de consentement mocké") */
    private String token;

    /** Type of medical section requested, e.g. "RAD_REPORTS" */
    private String section;

    /** Identifier of the target Node B holder, e.g. "CHU_TIZI_OUZOU" */
    private String targetNode;
}