import { ABTestConfig, ListenerConfig } from '../types/abtest';

export class ListenerGeneratorService {
  /**
   * Generates a Spring Boot ProcessEventListener for AB testing
   */
  generateListener(test: ABTestConfig): { code: string; config: ListenerConfig } {
    const packageName = this.extractPackageName(test.springProjectPath);
    const className = `${this.toPascalCase(test.name)}ABTestListener`;
    const filePath = `${test.springProjectPath}/src/main/java/${packageName.replace(/\./g, '/')}/listener/${className}.java`;

    const config: ListenerConfig = {
      packageName: `${packageName}.listener`,
      className,
      filePath,
      generated: false
    };

    const code = this.generateListenerCode(test, config);

    return { code, config };
  }

  private generateListenerCode(test: ABTestConfig, config: ListenerConfig): string {
    const armMappings = test.arms.map(arm => 
      `        processArmMapping.put("${arm.processDefinitionKey || arm.bpmnFile}", "${arm.armKey}");`
    ).join('\n');

    const armNames = test.arms.map(arm =>
      `        armNames.put("${arm.armKey}", "${arm.armName}");`
    ).join('\n');

    return `package ${config.packageName};

import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Auto-generated AB Test Listener for: ${test.name}
 * Generated on: ${new Date().toISOString()}
 * Test ID: ${test.id}
 */
@Component
public class ${config.className} implements ExecutionListener, TaskListener {
    
    private static final Logger logger = LoggerFactory.getLogger(${config.className}.class);
    private static final String AB_TEST_ID = "${test.id}";
    private static final String AB_TEST_API_BASE = "http://localhost:8080/api/ab-tests";
    
    @Autowired
    private RestTemplate restTemplate;
    
    // Process to Arm mapping
    private static final Map<String, String> processArmMapping = new HashMap<>();
    private static final Map<String, String> armNames = new HashMap<>();
    private static final Map<String, Long> executionStartTimes = new ConcurrentHashMap<>();
    private static final Map<String, List<ActivityExecution>> activityExecutions = new ConcurrentHashMap<>();
    
    static {
${armMappings}
${armNames}
    }
    
    @Override
    public void notify(DelegateExecution execution) throws Exception {
        try {
            String processDefinitionKey = execution.getProcessDefinitionId();
            String armKey = determineArmKey(processDefinitionKey);
            
            if (armKey == null) {
                logger.debug("Process {} not part of AB test {}", processDefinitionKey, AB_TEST_ID);
                return;
            }
            
            String eventName = execution.getEventName();
            String executionId = execution.getId();
            String activityId = execution.getCurrentActivityId();
            
            switch (eventName) {
                case "start":
                    handleProcessStart(execution, armKey);
                    break;
                case "end":
                    handleProcessEnd(execution, armKey);
                    break;
                case "take":
                    handleActivityStart(execution, armKey, activityId);
                    break;
                default:
                    logger.debug("Unhandled event: {} for execution: {}", eventName, executionId);
            }
        } catch (Exception e) {
            logger.error("Error in AB test listener for execution {}: {}", execution.getId(), e.getMessage(), e);
        }
    }
    
    @Override
    public void notify(DelegateTask task) {
        try {
            String processDefinitionKey = task.getProcessDefinitionId();
            String armKey = determineArmKey(processDefinitionKey);
            
            if (armKey == null) {
                return;
            }
            
            String eventName = task.getEventName();
            String taskId = task.getId();
            String activityId = task.getTaskDefinitionKey();
            
            switch (eventName) {
                case "create":
                    handleTaskCreate(task, armKey, activityId);
                    break;
                case "complete":
                    handleTaskComplete(task, armKey, activityId);
                    break;
                default:
                    logger.debug("Unhandled task event: {} for task: {}", eventName, taskId);
            }
        } catch (Exception e) {
            logger.error("Error in AB test task listener for task {}: {}", task.getId(), e.getMessage(), e);
        }
    }
    
    private String determineArmKey(String processDefinitionKey) {
        // Extract base process key (remove version suffix if present)
        String baseKey = processDefinitionKey.split(":")[0];
        return processArmMapping.get(baseKey);
    }
    
    private void handleProcessStart(DelegateExecution execution, String armKey) {
        String executionId = execution.getId();
        executionStartTimes.put(executionId, System.currentTimeMillis());
        activityExecutions.put(executionId, new ArrayList<>());
        
        Map<String, Object> logData = new HashMap<>();
        logData.put("testId", AB_TEST_ID);
        logData.put("executionId", executionId);
        logData.put("armKey", armKey);
        logData.put("armName", armNames.get(armKey));
        logData.put("event", "process_start");
        logData.put("timestamp", Instant.now().toString());
        logData.put("processInstanceId", execution.getProcessInstanceId());
        logData.put("requestPayload", execution.getVariables());
        
        sendToABTestAPI("/executions/start", logData);
    }
    
    private void handleProcessEnd(DelegateExecution execution, String armKey) {
        String executionId = execution.getId();
        Long startTime = executionStartTimes.remove(executionId);
        List<ActivityExecution> activities = activityExecutions.remove(executionId);
        
        long duration = startTime != null ? System.currentTimeMillis() - startTime : 0;
        
        Map<String, Object> logData = new HashMap<>();
        logData.put("testId", AB_TEST_ID);
        logData.put("executionId", executionId);
        logData.put("armKey", armKey);
        logData.put("armName", armNames.get(armKey));
        logData.put("event", "process_end");
        logData.put("timestamp", Instant.now().toString());
        logData.put("duration", duration);
        logData.put("status", "success");
        logData.put("processInstanceId", execution.getProcessInstanceId());
        logData.put("responsePayload", execution.getVariables());
        logData.put("activityExecutions", activities);
        
        sendToABTestAPI("/executions/complete", logData);
    }
    
    private void handleActivityStart(DelegateExecution execution, String armKey, String activityId) {
        String executionId = execution.getId();
        
        Map<String, Object> activityData = new HashMap<>();
        activityData.put("activityId", activityId);
        activityData.put("activityName", execution.getCurrentActivityName());
        activityData.put("startTime", Instant.now().toString());
        activityData.put("inputData", execution.getVariables());
        
        List<ActivityExecution> activities = activityExecutions.get(executionId);
        if (activities != null) {
            // Store activity start data (would be completed in handleActivityEnd)
            logger.debug("Activity {} started for execution {}", activityId, executionId);
        }
    }
    
    private void handleTaskCreate(DelegateTask task, String armKey, String activityId) {
        Map<String, Object> logData = new HashMap<>();
        logData.put("testId", AB_TEST_ID);
        logData.put("executionId", task.getExecutionId());
        logData.put("armKey", armKey);
        logData.put("armName", armNames.get(armKey));
        logData.put("event", "task_create");
        logData.put("timestamp", Instant.now().toString());
        logData.put("taskId", task.getId());
        logData.put("activityId", activityId);
        logData.put("activityName", task.getName());
        logData.put("assignee", task.getAssignee());
        
        sendToABTestAPI("/activities/start", logData);
    }
    
    private void handleTaskComplete(DelegateTask task, String armKey, String activityId) {
        Map<String, Object> logData = new HashMap<>();
        logData.put("testId", AB_TEST_ID);
        logData.put("executionId", task.getExecutionId());
        logData.put("armKey", armKey);
        logData.put("armName", armNames.get(armKey));
        logData.put("event", "task_complete");
        logData.put("timestamp", Instant.now().toString());
        logData.put("taskId", task.getId());
        logData.put("activityId", activityId);
        logData.put("activityName", task.getName());
        logData.put("outputData", task.getVariables());
        
        sendToABTestAPI("/activities/complete", logData);
    }
    
    private void sendToABTestAPI(String endpoint, Map<String, Object> data) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(data, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(
                AB_TEST_API_BASE + endpoint, 
                request, 
                String.class
            );
            
            if (!response.getStatusCode().is2xxSuccessful()) {
                logger.warn("AB test API call failed: {} - {}", response.getStatusCode(), response.getBody());
            }
        } catch (Exception e) {
            logger.error("Failed to send AB test data to API: {}", e.getMessage(), e);
        }
    }
    
    // Inner class for activity execution tracking
    public static class ActivityExecution {
        public String activityId;
        public String activityName;
        public String status;
        public String startTime;
        public String endTime;
        public long duration;
        public Map<String, Object> inputData;
        public Map<String, Object> outputData;
        public String errorMessage;
        
        // Constructors, getters, setters...
    }
}`;
  }

  private extractPackageName(projectPath: string): string {
    // Extract package name from project structure or use default
    const projectName = projectPath.split('/').pop() || 'demo';
    return `com.flowforge.${projectName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Injects the generated listener into the Spring Boot project
   */
  async injectListener(test: ABTestConfig, listenerCode: string, config: ListenerConfig): Promise<boolean> {
    try {
      // In a real implementation, this would write the file to the file system
      console.log(`Injecting listener into: ${config.filePath}`);
      console.log('Listener code:', listenerCode);
      
      // Mock successful injection
      return true;
    } catch (error) {
      console.error('Failed to inject listener:', error);
      return false;
    }
  }
}

export const listenerGenerator = new ListenerGeneratorService();