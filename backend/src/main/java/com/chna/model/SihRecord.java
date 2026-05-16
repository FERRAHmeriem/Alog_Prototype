package com.chna.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a record extracted from Node B's local SIH (Système d'Information Hospitalier)
 * in its raw proprietary format. This is what Filter 4 returns BEFORE Filter 1 translates it.
 *
 * Per doc.md §3.5.4, Filter 4 reads from the local DB in read-only mode.
 * The deliberately non-standard field names simulate a real legacy SIH schema.
 * This "before" object is displayed on Node B's screen to show the Anti-Corruption Layer in action.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SihRecord {
    /** Internal table name in the SIH proprietary schema */
    private String tableName;

    /** Internal row ID */
    private String internalId;

    /** Patient reference using the SIH's internal identifier (not IPN) */
    private String pat_ref;

    /** Type code in proprietary format (non-standard) */
    private String type_code;

    /** Raw result value as stored in the SIH */
    private String val_result;

    /** Exam date in DD/MM/YYYY format (non-ISO) */
    private String date_exm;

    /** Radiologist identifier in internal format */
    private String rad_id;

    /** Free text observation in French, unstructured */
    private String obs_libre;

    /** Internal status flag */
    private String statut;
}