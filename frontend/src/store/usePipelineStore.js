// Les 4 filtres et leur description
export const FILTER_META = {
  1: { label: "Filtre 1", description: "Traduction FHIR R4" },
  2: { label: "Filtre 2", description: "Vérification consentement" },
  3: { label: "Filtre 3", description: "Audit trail" },
  4: { label: "Filtre 4", description: "Lecture SIH local" },
};

// Ordre d'activation par pipeline
export const PIPELINE_ORDER = {
  1: [2, 3],       // filtres actifs ; 1 et 4 → ignored
  2: [2, 3, 4, 1], // tous actifs dans cet ordre
  3: [2, 3],       // 1 et 4 → ignored
};