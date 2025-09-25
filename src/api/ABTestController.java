package com.flowforge.abtest.controller;

import com.flowforge.abtest.dto.*;
import com.flowforge.abtest.service.ABTestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/**
 * REST Controller for AB Testing API
 */
@RestController
@RequestMapping("/api/ab-tests")
@CrossOrigin(origins = "*")
public class ABTestController {
    
    @Autowired
    private ABTestService abTestService;
    
    /**
     * Create a new AB test
     */
    @PostMapping
    public ResponseEntity<CreateABTestResponse> createABTest(@Valid @RequestBody CreateABTestRequest request) {
        try {
            CreateABTestResponse response = abTestService.createABTest(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                new CreateABTestResponse(false, null, "Failed to create AB test: " + e.getMessage())
            );
        }
    }
    
    /**
     * Get all AB tests
     */
    @GetMapping
    public ResponseEntity<List<ABTestSummaryDTO>> getAllABTests() {
        List<ABTestSummaryDTO> tests = abTestService.getAllABTests();
        return ResponseEntity.ok(tests);
    }
    
    /**
     * Get AB test by ID
     */
    @GetMapping("/{testId}")
    public ResponseEntity<ABTestDetailDTO> getABTest(@PathVariable String testId) {
        try {
            ABTestDetailDTO test = abTestService.getABTest(testId);
            return ResponseEntity.ok(test);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Update AB test
     */
    @PutMapping("/{testId}")
    public ResponseEntity<ABTestDetailDTO> updateABTest(
            @PathVariable String testId, 
            @Valid @RequestBody UpdateABTestRequest request) {
        try {
            ABTestDetailDTO test = abTestService.updateABTest(testId, request);
            return ResponseEntity.ok(test);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Start AB test
     */
    @PostMapping("/{testId}/start")
    public ResponseEntity<Void> startABTest(@PathVariable String testId) {
        try {
            abTestService.startABTest(testId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Stop AB test
     */
    @PostMapping("/{testId}/stop")
    public ResponseEntity<Void> stopABTest(@PathVariable String testId) {
        try {
            abTestService.stopABTest(testId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get AB test metrics
     */
    @GetMapping("/{testId}/metrics")
    public ResponseEntity<GetMetricsResponse> getMetrics(
            @PathVariable String testId,
            @RequestParam(defaultValue = "24h") String timeFilter) {
        try {
            GetMetricsResponse response = abTestService.getMetrics(testId, timeFilter);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get AB test execution logs
     */
    @GetMapping("/{testId}/logs")
    public ResponseEntity<GetLogsResponse> getLogs(
            @PathVariable String testId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int pageSize,
            @RequestParam(required = false) String armKey,
            @RequestParam(required = false) String status) {
        try {
            GetLogsResponse response = abTestService.getLogs(testId, page, pageSize, armKey, status);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Scan Spring Boot project for BPMN files
     */
    @PostMapping("/scan-project")
    public ResponseEntity<ProjectScanResponse> scanProject(@Valid @RequestBody ProjectScanRequest request) {
        try {
            ProjectScanResponse response = abTestService.scanProject(request.getProjectPath());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                new ProjectScanResponse(false, "Failed to scan project: " + e.getMessage(), null)
            );
        }
    }
    
    /**
     * Endpoint for listener to report execution data
     */
    @PostMapping("/executions/start")
    public ResponseEntity<Void> reportExecutionStart(@RequestBody ExecutionStartRequest request) {
        try {
            abTestService.recordExecutionStart(request);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Endpoint for listener to report execution completion
     */
    @PostMapping("/executions/complete")
    public ResponseEntity<Void> reportExecutionComplete(@RequestBody ExecutionCompleteRequest request) {
        try {
            abTestService.recordExecutionComplete(request);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Endpoint for listener to report activity data
     */
    @PostMapping("/activities/start")
    public ResponseEntity<Void> reportActivityStart(@RequestBody ActivityStartRequest request) {
        try {
            abTestService.recordActivityStart(request);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Endpoint for listener to report activity completion
     */
    @PostMapping("/activities/complete")
    public ResponseEntity<Void> reportActivityComplete(@RequestBody ActivityCompleteRequest request) {
        try {
            abTestService.recordActivityComplete(request);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

// Example DTO classes
class ProjectScanRequest {
    private String projectPath;
    
    public String getProjectPath() { return projectPath; }
    public void setProjectPath(String projectPath) { this.projectPath = projectPath; }
}

class ProjectScanResponse {
    private boolean success;
    private String message;
    private List<BpmnFileDTO> bpmnFiles;
    
    public ProjectScanResponse(boolean success, String message, List<BpmnFileDTO> bpmnFiles) {
        this.success = success;
        this.message = message;
        this.bpmnFiles = bpmnFiles;
    }
    
    // Getters and setters...
}

class ExecutionStartRequest {
    private String testId;
    private String executionId;
    private String armKey;
    private String armName;
    private String processInstanceId;
    private String timestamp;
    private Object requestPayload;
    
    // Getters and setters...
}

class ExecutionCompleteRequest {
    private String testId;
    private String executionId;
    private String armKey;
    private String armName;
    private String status;
    private Long duration;
    private String timestamp;
    private Object responsePayload;
    private List<ActivityExecutionDTO> activityExecutions;
    
    // Getters and setters...
}

class ActivityStartRequest {
    private String testId;
    private String executionId;
    private String armKey;
    private String activityId;
    private String activityName;
    private String timestamp;
    
    // Getters and setters...
}

class ActivityCompleteRequest {
    private String testId;
    private String executionId;
    private String armKey;
    private String activityId;
    private String activityName;
    private String timestamp;
    private Long duration;
    private Object outputData;
    
    // Getters and setters...
}