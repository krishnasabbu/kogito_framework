# COMPLETE Spring Boot Backend Implementation Guide
## Wells Fargo Workflow Management System - H2 Database

**CRITICAL: This contains ALL the code you need. Copy each section to the specified path.**

---

## 📋 Quick Setup Steps

1. Create a new Spring Boot project (Maven)
2. Create folder structure as shown below
3. Copy ALL files from this guide to their respective locations
4. Add dependencies from pom.xml section
5. Run `mvn clean install`
6. Run `mvn spring-boot:run`
7. Access: http://localhost:8080

---

## 📁 Required Folder Structure

```
backend/
└── src/main/
    ├── java/com/wellsfargo/workflow/
    │   ├── WorkflowApplication.java
    │   ├── abtest/
    │   │   ├── controller/
    │   │   ├── service/
    │   │   ├── repository/
    │   │   ├── entity/
    │   │   ├── dto/
    │   │   └── exception/
    │   ├── championchallenge/
    │   │   ├── controller/
    │   │   ├── service/
    │   │   ├── repository/
    │   │   ├── entity/
    │   │   ├── dto/
    │   │   └── exception/
    │   └── common/
    │       ├── service/
    │       ├── dto/
    │       └── config/
    └── resources/
        ├── application.yml
        ├── schema.sql
        └── data.sql
```

---

## pom.xml Dependencies

```xml
<dependencies>
    <!-- Spring Boot Starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <!-- H2 Database -->
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>

    <!-- Jackson -->
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
    </dependency>

    <!-- SpringDoc OpenAPI (Swagger) -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.2.0</version>
    </dependency>
</dependencies>

<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <configuration>
                <excludes>
                    <exclude>
                        <groupId>org.projectlombok</groupId>
                        <artifactId>lombok</artifactId>
                    </exclude>
                </excludes>
            </configuration>
        </plugin>
    </plugins>
</build>
```

---

## Main Application Class

**File: `src/main/java/com/wellsfargo/workflow/WorkflowApplication.java`**

```java
package com.wellsfargo.workflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories
public class WorkflowApplication {
    public static void main(String[] args) {
        SpringApplication.run(WorkflowApplication.java, args);
        System.out.println("\n===========================================");
        System.out.println("Wells Fargo Workflow Management System");
        System.out.println("Application started successfully!");
        System.out.println("H2 Console: http://localhost:8080/h2-console");
        System.out.println("Swagger UI: http://localhost:8080/swagger-ui.html");
        System.out.println("===========================================\n");
    }
}
```

---

## Configuration Files

**File: `src/main/resources/application.yml`**
Already created above (see schema.sql and data.sql files already created)

---

## Common Files (Shared by both systems)

### WorkflowExecutionService.java

**File: `src/main/java/com/wellsfargo/workflow/common/service/WorkflowExecutionService.java`**

```java
package com.wellsfargo.workflow.common.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.Random;

@Service
@Slf4j
public class WorkflowExecutionService {

    private final Random random = new Random();

    public long simulateExecution(String bpmnFilePath) {
        long baseTime = 100 + random.nextInt(300);

        // Simulate execution delay
        try {
            Thread.sleep(baseTime);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Execution interrupted", e);
        }

        // Simulate 10% failure rate
        if (random.nextDouble() < 0.1) {
            throw new RuntimeException("Simulated execution error");
        }

        return baseTime;
    }

    public long simulateNodeExecution(String nodeType, boolean isChallenge) {
        long baseTime = 100 + random.nextInt(300);

        if (isChallenge) {
            baseTime = (long) (baseTime * 1.3); // Challenge is 30% slower
        }

        try {
            Thread.sleep(baseTime);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Simulate 10% error rate (except for start/end events)
        if (!nodeType.contains("Event") && random.nextDouble() < 0.1) {
            throw new RuntimeException("Simulated node error in " + nodeType);
        }

        return baseTime;
    }
}
```

### ErrorResponse.java

**File: `src/main/java/com/wellsfargo/workflow/common/dto/ErrorResponse.java`**

```java
package com.wellsfargo.workflow.common.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private String message;
    private String error;
    private LocalDateTime timestamp;
    private String path;

    public static ErrorResponse of(String message, String error) {
        return ErrorResponse.builder()
            .message(message)
            .error(error)
            .timestamp(LocalDateTime.now())
            .build();
    }
}
```

### WebConfig.java

**File: `src/main/java/com/wellsfargo/workflow/common/config/WebConfig.java`**

```java
package com.wellsfargo.workflow.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

---

## DATABASE FILES ALREADY CREATED ABOVE (schema.sql, data.sql, application.yml)

---

## A/B TESTING ENTITIES ALREADY CREATED ABOVE

---

CONTINUE TO NEXT DOCUMENTATION FILE FOR SERVICE IMPLEMENTATION...

This guide is split into multiple files due to length. See:
1. This file - Configuration & Common files
2. COMPLETE_ABTEST_SERVICE.md - A/B Testing Service Implementation
3. COMPLETE_ABTEST_CONTROLLER.md - A/B Testing Controller
4. COMPLETE_CHAMPION_CHALLENGE.md - Champion/Challenge Full Implementation

**Total files: 50+ Java files needed for complete implementation**
