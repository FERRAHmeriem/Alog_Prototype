package com.chna.mock;

import com.chna.model.FhirResponse;
import com.chna.model.SihRecord;
import org.springframework.stereotype.Component;

/**
 * In-memory mock of Node B's local SIH (Système d'Information Hospitalier).
 * Per rules.md §5 and prototype.md, no real database is used.
 *
 * This class provides:
 *   - getRawRecord(): the proprietary-format data that Filter 4 reads from the local SIH.
 *   - getTranslatedFhirResponse(): the FHIR R4 resource that Filter 1 (Anti-Corruption Layer) produces.
 *
 * The deliberate mismatch between these two objects is the core pedagogical point of Pipeline 2.
 * An observer can see the raw SIH data on the left and the standardized FHIR output on the right.
 */
@Component
public class SihMockData {

    /**
     * Raw SIH record for patient DZ-2019-00442 (Benali Amine).
     * Simulates a real SQL result row from a legacy SIH using proprietary column names.
     * This is what Filter 4 retrieves before the Anti-Corruption Layer runs.
     */
    public SihRecord getRawRecord() {
        return SihRecord.builder()
                .tableName("RAD_REPORTS")
                .internalId("TIZI_RAD_88")
                .pat_ref("PNT-4421990-TIZ") // SIH internal patient ref (not IPN)
                .type_code("IRM_RACHIS_L")   // proprietary code, not SNOMED/LOINC
                .val_result("OPAC_L4L5_DISC_HERN") // raw encoded result
                .date_exm("12/04/2024")     // non-ISO date format
                .rad_id("RAD_MEZIANI_07")   // internal radiologist ID
                .obs_libre("Hernie discale postéro-latérale gauche L4-L5 avec compression radiculaire L5. " +
                           "Rétrécissement du canal rachidien à ce niveau. Pas d'autre anomalie notable.")
                .statut("VAL")              // proprietary status code
                .build();
    }

    /**
     * FHIR R4 DiagnosticReport resource produced by Filter 1 from the raw SIH record above.
     * This is what travels on the mTLS P2P channel to Node A.
     * Per doc.md §3.5.2, the Anti-Corruption Layer (HAPI FHIR SDK in production) performs this translation.
     */
    public FhirResponse getTranslatedFhirResponse(String patientId) {
        return FhirResponse.builder()
                .resourceType("DiagnosticReport")
                .id("diag-report-tizi-88")
                .status("final")
                .code("24627-2")            // LOINC code for MRI spine
                .display("IRM Rachis Lombaire")
                .subjectId(patientId)
                .conclusion("Hernie discale postéro-latérale gauche L4-L5 avec compression " +
                            "radiculaire L5 confirmée. Rétrécissement canalaire associé. " +
                            "Corrélation clinique recommandée. Validé par le Dr. Meziani — CHU Tizi Ouzou.")
                .effectiveDateTime("2024-04-12T09:30:00+01:00") // ISO-8601
                .sourceNode("CHU_TIZI_OUZOU")
                .build();
    }
}