package com.chna.config;

// Pipeline2Config.java — le plus important
@Configuration
public class Pipeline2Config {

    @Bean
    public IntegrationFlow pipeline2Flow(
            ConsentFilter consentFilter,
            AuditFilter auditFilter,
            SihFetchFilter sihFilter,
            FhirTranslatorFilter fhirFilter,
            FilterEventEmitter emitter) {

        return IntegrationFlows
            .from("pipeline2.input")

            .handle(consentFilter,             // Filtre ②
                e -> e.advice(emitEvent(emitter, 2, "active")))

            .handle(auditFilter,               // Filtre ③
                e -> e.advice(emitEvent(emitter, 3, "active")))

            .handle(sihFilter,                 // Filtre ④ — lit le SIH propriétaire
                e -> e.advice(emitEvent(emitter, 4, "active")))

            .handle(fhirFilter,                // Filtre ① — traduit en FHIR R4
                e -> e.advice(emitEvent(emitter, 1, "active")))

            .channel("pipeline2.output")
            .get();
    }
}