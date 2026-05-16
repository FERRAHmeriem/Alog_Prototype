package com.chna.see;

import com.chna.model.FilterEvent;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.time.Instant;

/**
 * FilterEventEmitter — broadcasts Pipe & Filter events to ALL SSE subscribers.
 *
 * Uses replay(64) so that:
 *  - Every browser window connected to /api/events receives EVERY event.
 *  - Windows opening slightly late (or reconnecting) still receive recent events.
 *
 * This is the key component enabling the multi-window live demo.
 */
@Component
public class FilterEventEmitter {

    // replay(64) = keeps last 64 events in buffer.
    // Every new SSE subscriber immediately receives buffered events,
    // and ALL active subscribers receive new events simultaneously.
    private final Sinks.Many<FilterEvent> sink =
        Sinks.many().replay().limit(64);

    public void emit(int filterId, String status) {
        emit(filterId, status, null);
    }

    public void emit(int filterId, String status, Object payload) {
        sink.tryEmitNext(new FilterEvent(filterId, status, payload,
            Instant.now().toString()));
    }

    /**
     * Returns the hot flux shared across ALL SSE connections.
     * Each call to getFlux() subscribes to the same underlying replay sink.
     */
    public Flux<FilterEvent> getFlux() {
        return sink.asFlux();
    }
}
