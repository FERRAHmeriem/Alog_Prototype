package com.chna.config;

// Pipeline1Config.java
@Configuration
public class Pipeline1Config {

    @Bean
    public IntegrationFlow pipeline1Flow(
            ConsentFilter consentFilter,
            AuditFilter auditFilter,
            FilterEventEmitter emitter) {

        return IntegrationFlows
            .from("pipeline1.input")           // MessageChannel d'entrée
            
            .handle(consentFilter,             // Filtre ② — consent + token
                e -> e.advice(emitEvent(emitter, 2, "active")))
            
            .handle(auditFilter,               // Filtre ③ — audit trail
                e -> e.advice(emitEvent(emitter, 3, "active")))

            // Filtres ① et ④ : ignorés → on émet "ignored"
            .handle(msg -> {
                emitter.emit(1, "ignored");
                emitter.emit(4, "ignored");
            })

            .channel("pipeline1.output")       // sort vers le front
            .get();
    }
}