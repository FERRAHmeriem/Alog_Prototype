package com.chna.controller;
@RestController
@RequestMapping("/api")
public class PipelineController {

    @Autowired private MessageChannel pipeline1Input;
    @Autowired private MessageChannel pipeline2Input;
    @Autowired private FilterEventEmitter emitter;

    // POST /api/pipeline/1  → déclenche Pipeline 1
    @PostMapping("/pipeline/1")
    public ResponseEntity<Void> triggerPipeline1(@RequestBody FhirRequest req) {
        pipeline1Input.send(MessageBuilder.withPayload(req).build());
        return ResponseEntity.accepted().build();
    }

    // GET /api/events  → flux SSE vers React (EventSource)
    @GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<FilterEvent>> streamEvents() {
        return emitter.getFlux()
            .map(event -> ServerSentEvent.<FilterEvent>builder()
                .event("filter-update")
                .data(event)
                .build());
    }
}