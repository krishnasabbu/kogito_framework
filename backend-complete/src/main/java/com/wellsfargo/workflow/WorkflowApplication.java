package com.wellsfargo.workflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class WorkflowApplication {
    public static void main(String[] args) {
        SpringApplication.run(WorkflowApplication.java, args);
        System.out.println("\n===========================================");
        System.out.println("Wells Fargo Workflow Management System");
        System.out.println("H2 Console: http://localhost:8080/h2-console");
        System.out.println("Swagger: http://localhost:8080/swagger-ui.html");
        System.out.println("===========================================\n");
    }
}
