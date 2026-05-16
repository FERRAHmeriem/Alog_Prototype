package com.chna.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/health")
public class HealthController {
    
    @GetMapping
    public Mono<String> health() {
        return Mono.just("UP");
    }
}
