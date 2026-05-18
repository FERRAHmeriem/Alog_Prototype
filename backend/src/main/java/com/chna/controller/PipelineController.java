package com.chna.controller;

import com.chna.model.FhirRequest;
import com.chna.model.FhirResponse;
import com.chna.model.FilterEvent;
import com.chna.model.PipelineContext;
import com.chna.see.FilterEventEmitter;
import com.chna.service.Pipeline1Service;
import com.chna.service.Pipeline2Service;
import com.chna.service.Pipeline3Service;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import java.util.Map;

/**
 * REST Controller exposing the 3 pipelines for the React frontend to trigger.
 * Uses WebFlux to stream SSE events to the frontend via /api/events.
 */
@RestController
@RequestMapping("/api")
public class PipelineController {

    private final Pipeline1Service pipeline1Service;
    private final Pipeline2Service pipeline2Service;
    private final Pipeline3Service pipeline3Service;
    private final FilterEventEmitter emitter;

    // We store the original request here just for the mock Pipeline 3 execution
    // In a real system, the original request context would be held in the saga
    // orchestrator
    private FhirRequest currentRequest;

    public PipelineController(Pipeline1Service pipeline1Service,
            Pipeline2Service pipeline2Service,
            Pipeline3Service pipeline3Service,
            FilterEventEmitter emitter) {
        this.pipeline1Service = pipeline1Service;
        this.pipeline2Service = pipeline2Service;
        this.pipeline3Service = pipeline3Service;
        this.emitter = emitter;
    }

    /**
     * PIPELINE 1: Node A sends the request
     */
    @PostMapping("/pipeline/1")
    public ResponseEntity<?> triggerPipeline1(@RequestBody FhirRequest request) {
        this.currentRequest = request; // save for pipeline 3
        PipelineContext result = pipeline1Service.execute(request);

        if (result.isBlocked()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", result.getBlockReason()));
        }
        return ResponseEntity.ok(result.getRequest());
    }

    /**
     * PIPELINE 2: Node B processes the request and translates SIH data to FHIR
     */
    @PostMapping("/pipeline/2")
    public ResponseEntity<?> triggerPipeline2(@RequestBody FhirRequest request) {
        PipelineContext result = pipeline2Service.execute(request);

        if (result.isBlocked()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", result.getBlockReason()));
        }

        // Return the translated FHIR resource
        return ResponseEntity.ok(result.getFhirResponse());
    }

    /**
     * PIPELINE 3: Node A receives the FHIR data and persists it
     */
    @PostMapping("/pipeline/3")
    public ResponseEntity<?> triggerPipeline3(@RequestBody FhirResponse response) {
        // We use the saved request to simulate the coherence check
        PipelineContext result = pipeline3Service.execute(response, this.currentRequest);

        if (result.isBlocked()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", result.getBlockReason()));
        }

        return ResponseEntity.ok(result.getFhirResponse());
    }

    /**
     * SSE endpoint: React connects here to receive real-time filter animation
     * events.
     * We map the events to ServerSentEvent with name "filter-update" to match the
     * frontend listener.
     */
    @GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<org.springframework.http.codec.ServerSentEvent<FilterEvent>> streamEvents() {
        return emitter.getFlux()
                .map(event -> org.springframework.http.codec.ServerSentEvent.<FilterEvent>builder()
                        .event("filter-update")
                        .data(event)
                        .build());
    }
}