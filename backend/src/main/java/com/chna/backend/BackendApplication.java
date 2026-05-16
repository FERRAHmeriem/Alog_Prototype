package com.chna.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Spring Integration works automatically if beans are defined,
// we'll just stick to standard Spring Boot beans for this prototype
// without complex DSL.
@SpringBootApplication(scanBasePackages = "com.chna")
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}
}
