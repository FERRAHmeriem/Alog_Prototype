package com.chna.see;
// sse/FilterEventEmitter.java
@Component
public class FilterEventEmitter {

    // Sinks.Many = flux réactif multicast vers tous les abonnés SSE
    private final Sinks.Many<FilterEvent> sink =
        Sinks.many().multicast().onBackpressureBuffer();

    public void emit(int filterId, String status) {
        emit(filterId, status, null);
    }

    public void emit(int filterId, String status, Object payload) {
        sink.tryEmitNext(new FilterEvent(filterId, status, payload,
            Instant.now().toString()));
    }

    public Flux<FilterEvent> getFlux() {
        return sink.asFlux();
    }
}