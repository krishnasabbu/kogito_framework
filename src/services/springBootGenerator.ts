import { WorkflowDefinition, RestServiceConfig } from '../types/kogito';

export interface SpringBootProject {
  id: string;
  workflowId: string;
  projectName: string;
  files: ProjectFile[];
  createdAt: string;
  status: 'generating' | 'ready' | 'running' | 'stopped' | 'error';
  port: number;
  endpoints: ApiEndpoint[];
}

export interface ProjectFile {
  path: string;
  name: string;
  content: string;
  type: 'java' | 'xml' | 'properties' | 'json' | 'yaml' | 'md';
  isDirectory: boolean;
  children?: ProjectFile[];
}

export interface ApiEndpoint {
  path: string;
  method: string;
  description: string;
  requestBody?: any;
  responseBody?: any;
}

class SpringBootGeneratorService {
  private projects: Map<string, SpringBootProject> = new Map();
  private mockServers: Map<string, any> = new Map();

  async generateProject(workflow: WorkflowDefinition, serviceMappings: Record<string, RestServiceConfig>): Promise<SpringBootProject> {
    const projectId = `project-${workflow.id}`;
    const projectName = this.sanitizeProjectName(workflow.name);
    const port = 8080 + Math.floor(Math.random() * 1000);

    // Check if project already exists
    if (this.projects.has(projectId)) {
      return this.projects.get(projectId)!;
    }
    const project: SpringBootProject = {
      id: projectId,
      workflowId: workflow.id,
      projectName,
      files: [],
      createdAt: new Date().toISOString(),
      status: 'generating',
      port,
      endpoints: []
    };

    this.projects.set(projectId, project);

    // Simulate project generation
    setTimeout(() => {
      project.files = this.generateProjectFiles(workflow, serviceMappings, projectName, port);
      project.endpoints = this.generateApiEndpoints(workflow, serviceMappings);
      project.status = 'ready';
    }, 2000);

    return project;
  }

  private sanitizeProjectName(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private generateProjectFiles(
    workflow: WorkflowDefinition, 
    serviceMappings: Record<string, RestServiceConfig>,
    projectName: string,
    port: number
  ): ProjectFile[] {
    const packageName = `com.flowforge.${projectName.replace(/-/g, '')}`;
    const packagePath = packageName.replace(/\./g, '/');

    return [
      // Root directory
      {
        path: '',
        name: projectName,
        content: '',
        type: 'java',
        isDirectory: true,
        children: [
          // Source directory structure
          {
            path: 'src',
            name: 'src',
            content: '',
            type: 'java',
            isDirectory: true,
            children: [
              {
                path: 'src/main',
                name: 'main',
                content: '',
                type: 'java',
                isDirectory: true,
                children: [
                  {
                    path: 'src/main/java',
                    name: 'java',
                    content: '',
                    type: 'java',
                    isDirectory: true,
                    children: [
                      {
                        path: `src/main/java/${packagePath}`,
                        name: packagePath.split('/').pop() || 'app',
                        content: '',
                        type: 'java',
                        isDirectory: true,
                        children: [
                          // Main Application Class
                          {
                            path: `src/main/java/${packagePath}/Application.java`,
                            name: 'Application.java',
                            content: this.generateMainApplication(packageName, projectName),
                            type: 'java',
                            isDirectory: false
                          },
                          // Workflow Controller
                          {
                            path: `src/main/java/${packagePath}/controller/WorkflowController.java`,
                            name: 'WorkflowController.java',
                            content: this.generateWorkflowController(packageName, workflow, serviceMappings),
                            type: 'java',
                            isDirectory: false
                          },
                          // Service Classes
                          {
                            path: `src/main/java/${packagePath}/service/WorkflowService.java`,
                            name: 'WorkflowService.java',
                            content: this.generateWorkflowService(packageName, workflow, serviceMappings),
                            type: 'java',
                            isDirectory: false
                          },
                          // Model Classes
                          {
                            path: `src/main/java/${packagePath}/model/WorkflowRequest.java`,
                            name: 'WorkflowRequest.java',
                            content: this.generateWorkflowRequest(packageName),
                            type: 'java',
                            isDirectory: false
                          },
                          {
                            path: `src/main/java/${packagePath}/model/WorkflowResponse.java`,
                            name: 'WorkflowResponse.java',
                            content: this.generateWorkflowResponse(packageName),
                            type: 'java',
                            isDirectory: false
                          }
                        ]
                      }
                    ]
                  },
                  {
                    path: 'src/main/resources',
                    name: 'resources',
                    content: '',
                    type: 'properties',
                    isDirectory: true,
                    children: [
                      // Application Properties
                      {
                        path: 'src/main/resources/application.yml',
                        name: 'application.yml',
                        content: this.generateApplicationYml(port),
                        type: 'yaml',
                        isDirectory: false
                      },
                      // BPMN Process
                      {
                        path: 'src/main/resources/processes/workflow.bpmn',
                        name: 'workflow.bpmn',
                        content: workflow.bpmnContent || this.generateDefaultBpmn(workflow.name),
                        type: 'xml',
                        isDirectory: false
                      }
                    ]
                  }
                ]
              }
            ]
          },
          // Maven POM
          {
            path: 'pom.xml',
            name: 'pom.xml',
            content: this.generatePomXml(projectName, packageName),
            type: 'xml',
            isDirectory: false
          },
          // README
          {
            path: 'README.md',
            name: 'README.md',
            content: this.generateReadme(workflow, projectName),
            type: 'md',
            isDirectory: false
          }
        ]
      }
    ];
  }

  private generateMainApplication(packageName: string, projectName: string): string {
    const className = this.toPascalCase(projectName) + 'Application';
    return `package ${packageName};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@SpringBootApplication
public class ${className} {

    public static void main(String[] args) {
        SpringApplication.run(${className}.class, args);
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}`;
  }

  private generateWorkflowController(packageName: string, workflow: WorkflowDefinition, serviceMappings: Record<string, RestServiceConfig>): string {
    return `package ${packageName}.controller;

import ${packageName}.model.WorkflowRequest;
import ${packageName}.model.WorkflowResponse;
import ${packageName}.service.WorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/workflow")
@CrossOrigin(origins = "*")
public class WorkflowController {

    @Autowired
    private WorkflowService workflowService;

    @PostMapping("/execute")
    public ResponseEntity<WorkflowResponse> executeWorkflow(@RequestBody WorkflowRequest request) {
        try {
            WorkflowResponse response = workflowService.executeWorkflow(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            WorkflowResponse errorResponse = new WorkflowResponse();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Workflow execution failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        return ResponseEntity.ok(Map.of(
            "status", "running",
            "workflow", "${workflow.name}",
            "version", "${workflow.version}",
            "timestamp", System.currentTimeMillis()
        ));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
}`;
  }

  private generateWorkflowService(packageName: string, workflow: WorkflowDefinition, serviceMappings: Record<string, RestServiceConfig>): string {
    const serviceCallsCode = Object.entries(serviceMappings).map(([nodeId, config]) => {
      return `
        // Service call for ${config.name}
        try {
            Map<String, Object> serviceRequest = new HashMap<>();
            ${this.generateMappingCode(config)}
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            ${Object.entries(config.headers).map(([key, value]) => 
              `headers.set("${key}", "${value}");`
            ).join('\n            ')}
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(serviceRequest, headers);
            
            ResponseEntity<Map> serviceResponse = restTemplate.exchange(
                "${config.url}",
                HttpMethod.${config.method},
                entity,
                Map.class
            );
            
            if (serviceResponse.getStatusCode().is2xxSuccessful()) {
                // Merge response back to workflow data
                Map<String, Object> responseData = serviceResponse.getBody();
                if (responseData != null) {
                    workflowData.putAll(responseData);
                }
            }
        } catch (Exception e) {
            System.err.println("Service call failed for ${config.name}: " + e.getMessage());
        }`;
    }).join('\n');

    return `package ${packageName}.service;

import ${packageName}.model.WorkflowRequest;
import ${packageName}.model.WorkflowResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class WorkflowService {

    @Autowired
    private RestTemplate restTemplate;

    public WorkflowResponse executeWorkflow(WorkflowRequest request) {
        WorkflowResponse response = new WorkflowResponse();
        
        try {
            // Initialize workflow data with request
            Map<String, Object> workflowData = new HashMap<>(request.getData());
            
            System.out.println("Starting workflow execution for: ${workflow.name}");
            System.out.println("Input data: " + workflowData);
            
            ${serviceCallsCode}
            
            // Build response
            response.setSuccess(true);
            response.setMessage("Workflow executed successfully");
            response.setData(workflowData);
            response.setWorkflowId("${workflow.id}");
            response.setExecutionId("exec-" + System.currentTimeMillis());
            
            System.out.println("Workflow execution completed successfully");
            System.out.println("Output data: " + workflowData);
            
        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Workflow execution failed: " + e.getMessage());
            System.err.println("Workflow execution failed: " + e.getMessage());
            e.printStackTrace();
        }
        
        return response;
    }
}`;
  }

  private generateMappingCode(config: RestServiceConfig): string {
    return config.requestMapping?.map(mapping => {
      if (mapping.sourceField && mapping.targetField) {
        return `serviceRequest.put("${mapping.targetField}", workflowData.get("${mapping.sourceField}"));`;
      } else if (mapping.staticValue && mapping.targetField) {
        return `serviceRequest.put("${mapping.targetField}", "${mapping.staticValue}");`;
      }
      return '';
    }).filter(Boolean).join('\n            ') || '';
  }

  private generateWorkflowRequest(packageName: string): string {
    return `package ${packageName}.model;

import java.util.Map;

public class WorkflowRequest {
    private Map<String, Object> data;
    private String workflowId;
    private String executionId;

    public Map<String, Object> getData() {
        return data;
    }

    public void setData(Map<String, Object> data) {
        this.data = data;
    }

    public String getWorkflowId() {
        return workflowId;
    }

    public void setWorkflowId(String workflowId) {
        this.workflowId = workflowId;
    }

    public String getExecutionId() {
        return executionId;
    }

    public void setExecutionId(String executionId) {
        this.executionId = executionId;
    }
}`;
  }

  private generateWorkflowResponse(packageName: string): string {
    return `package ${packageName}.model;

import java.util.Map;

public class WorkflowResponse {
    private boolean success;
    private String message;
    private Map<String, Object> data;
    private String workflowId;
    private String executionId;
    private long timestamp;

    public WorkflowResponse() {
        this.timestamp = System.currentTimeMillis();
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Map<String, Object> getData() {
        return data;
    }

    public void setData(Map<String, Object> data) {
        this.data = data;
    }

    public String getWorkflowId() {
        return workflowId;
    }

    public void setWorkflowId(String workflowId) {
        this.workflowId = workflowId;
    }

    public String getExecutionId() {
        return executionId;
    }

    public void setExecutionId(String executionId) {
        this.executionId = executionId;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}`;
  }

  private generateApplicationYml(port: number): string {
    return `server:
  port: ${port}

spring:
  application:
    name: flowforge-workflow
  
logging:
  level:
    com.flowforge: DEBUG
    org.springframework.web: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: always`;
  }

  private generatePomXml(projectName: string, packageName: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>

    <groupId>com.flowforge</groupId>
    <artifactId>${projectName}</artifactId>
    <version>1.0.0</version>
    <name>${projectName}</name>
    <description>FlowForge Generated Workflow Application</description>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`;
  }

  private generateDefaultBpmn(workflowName: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                   xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                   xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                   xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
                   id="workflow-definition" 
                   targetNamespace="http://www.omg.org/bpmn20">
  <bpmn2:process id="workflow-process" name="${workflowName}" isExecutable="true">
    <bpmn2:startEvent id="start-event" name="Start">
      <bpmn2:outgoing>start-to-end</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:endEvent id="end-event" name="End">
      <bpmn2:incoming>start-to-end</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:sequenceFlow id="start-to-end" sourceRef="start-event" targetRef="end-event"/>
  </bpmn2:process>
</bpmn2:definitions>`;
  }

  private generateReadme(workflow: WorkflowDefinition, projectName: string): string {
    return `# ${workflow.name}

Generated Spring Boot application for FlowForge workflow.

## Description
${workflow.description || 'No description provided'}

## API Endpoints

### Execute Workflow
\`\`\`
POST /api/workflow/execute
Content-Type: application/json

{
  "data": {
    // Your workflow input data
  }
}
\`\`\`

### Health Check
\`\`\`
GET /api/workflow/health
\`\`\`

### Status
\`\`\`
GET /api/workflow/status
\`\`\`

## Running the Application

\`\`\`bash
mvn spring-boot:run
\`\`\`

## Testing

Use the integrated Postman-style interface to test the API endpoints.

---
Generated by FlowForge Platform`;
  }

  private generateApiEndpoints(workflow: WorkflowDefinition, serviceMappings: Record<string, RestServiceConfig>): ApiEndpoint[] {
    return [
      {
        path: '/api/workflow/execute',
        method: 'POST',
        description: 'Execute the workflow with input data',
        requestBody: {
          data: {
            // Sample based on workflow variables or initial request
          }
        },
        responseBody: {
          success: true,
          message: 'Workflow executed successfully',
          data: {},
          workflowId: workflow.id,
          executionId: 'exec-123456789',
          timestamp: Date.now()
        }
      },
      {
        path: '/api/workflow/status',
        method: 'GET',
        description: 'Get workflow status and information',
        responseBody: {
          status: 'running',
          workflow: workflow.name,
          version: workflow.version,
          timestamp: Date.now()
        }
      },
      {
        path: '/api/workflow/health',
        method: 'GET',
        description: 'Health check endpoint',
        responseBody: {
          status: 'UP'
        }
      }
    ];
  }

  private toPascalCase(str: string): string {
    return str.replace(/(^\w|-\w)/g, (match) => match.replace('-', '').toUpperCase());
  }

  getProject(projectId: string): SpringBootProject | undefined {
    return this.projects.get(projectId);
  }

  getAllProjects(): SpringBootProject[] {
    return Array.from(this.projects.values());
  }

  async startProject(projectId: string): Promise<void> {
    const project = this.projects.get(projectId);
    if (project) {
      project.status = 'running';
      
      // Create mock server endpoints
      this.createMockServer(project);
      
      // Simulate server startup delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Project ${project.projectName} started on port ${project.port}`);
    }
  }

  async stopProject(projectId: string): Promise<void> {
    const project = this.projects.get(projectId);
    if (project) {
      project.status = 'stopped';
      this.mockServers.delete(projectId);
    }
  }

  private createMockServer(project: SpringBootProject) {
    const mockServer = {
      port: project.port,
      endpoints: new Map()
    };

    // Create mock endpoints
    project.endpoints.forEach(endpoint => {
      const key = `${endpoint.method}:${endpoint.path}`;
      mockServer.endpoints.set(key, {
        handler: (requestData: any) => {
          if (endpoint.path === '/api/workflow/execute') {
            return {
              success: true,
              message: 'Workflow executed successfully',
              data: {
                ...requestData,
                processedAt: new Date().toISOString(),
                workflowResult: 'completed'
              },
              workflowId: project.workflowId,
              executionId: `exec-${Date.now()}`,
              timestamp: Date.now()
            };
          } else if (endpoint.path === '/api/workflow/status') {
            return {
              status: 'running',
              workflow: project.projectName,
              version: '1.0.0',
              timestamp: Date.now(),
              uptime: Date.now() - new Date(project.createdAt).getTime()
            };
          } else if (endpoint.path === '/api/workflow/health') {
            return {
              status: 'UP',
              timestamp: new Date().toISOString()
            };
          }
          return endpoint.responseBody;
        }
      });
    });

    this.mockServers.set(project.id, mockServer);
  }

  async callMockAPI(projectId: string, method: string, path: string, requestData?: any): Promise<any> {
    const mockServer = this.mockServers.get(projectId);
    if (!mockServer) {
      throw new Error('Server not running');
    }

    const key = `${method}:${path}`;
    const endpoint = mockServer.endpoints.get(key);
    
    if (!endpoint) {
      throw new Error(`Endpoint ${method} ${path} not found`);
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    
    return endpoint.handler(requestData);
  }

  isServerRunning(projectId: string): boolean {
    return this.mockServers.has(projectId);
  }
}

export const springBootGenerator = new SpringBootGeneratorService();