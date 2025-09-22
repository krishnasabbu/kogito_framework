import { 
  WorkflowDefinition, 
  WorkflowExecution, 
  ABTest, 
  ABTestMetrics,
  ProcessInstance,
  TaskInstance,
  WorkflowTemplate,
  WorkflowValidationResult
} from '../types/kogito';
import { mockKogitoService } from './mockKogitoService';

// Use mock service in development when backend is not available
const USE_MOCK_SERVICE = import.meta.env.DEV;

class KogitoService {
  private baseUrl = '/api/kogito';

  // Workflow Management
  async getWorkflows(): Promise<WorkflowDefinition[]> {
    if (USE_MOCK_SERVICE) {
      return mockKogitoService.getWorkflows();
    }
    const response = await fetch(`${this.baseUrl}/workflows`);
    if (!response.ok) throw new Error('Failed to fetch workflows');
    console.log("json === "+response.json);
    return response.json();
  }

  async getWorkflow(id: string): Promise<WorkflowDefinition> {
    if (USE_MOCK_SERVICE) {
      return mockKogitoService.getWorkflow(id);
    }
    const response = await fetch(`${this.baseUrl}/workflows/${id}`);
    if (!response.ok) throw new Error('Failed to fetch workflow');
    return response.json();
  }

  async createWorkflow(workflow: Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkflowDefinition> {
    if (USE_MOCK_SERVICE) {
      return mockKogitoService.createWorkflow(workflow);
    }
    const response = await fetch(`${this.baseUrl}/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflow)
    });
    if (!response.ok) throw new Error('Failed to create workflow');
    return response.json();
  }

  async updateWorkflow(id: string, workflow: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> {
    if (USE_MOCK_SERVICE) {
      return mockKogitoService.updateWorkflow(id, workflow);
    }
    const response = await fetch(`${this.baseUrl}/workflows/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflow)
    });
    if (!response.ok) throw new Error('Failed to update workflow');
    return response.json();
  }

  async deleteWorkflow(id: string): Promise<void> {
    if (USE_MOCK_SERVICE) {
      return mockKogitoService.deleteWorkflow(id);
    }
    const response = await fetch(`${this.baseUrl}/workflows/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete workflow');
  }

  async validateWorkflow(bpmnContent: string, dmnContent?: string): Promise<WorkflowValidationResult> {
    if (USE_MOCK_SERVICE) {
      return mockKogitoService.validateWorkflow(bpmnContent, dmnContent);
    }
    const response = await fetch(`${this.baseUrl}/workflows/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bpmnContent, dmnContent })
    });
    if (!response.ok) throw new Error('Failed to validate workflow');
    return response.json();
  }

  // Workflow Execution
  async executeWorkflow(workflowId: string, inputData: Record<string, any>, abTestId?: string): Promise<WorkflowExecution> {
    if (USE_MOCK_SERVICE) {
      return mockKogitoService.executeWorkflow(workflowId, inputData, abTestId);
    }
    const response = await fetch(`${this.baseUrl}/workflows/${workflowId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputData, abTestId })
    });
    if (!response.ok) throw new Error('Failed to execute workflow');
    return response.json();
  }

  async getExecution(executionId: string): Promise<WorkflowExecution> {
    if (USE_MOCK_SERVICE) {
      return mockKogitoService.getExecution(executionId);
    }
    const response = await fetch(`${this.baseUrl}/executions/${executionId}`);
    if (!response.ok) throw new Error('Failed to fetch execution');
    return response.json();
  }

  async getExecutions(workflowId?: string, status?: string): Promise<WorkflowExecution[]> {
    if (USE_MOCK_SERVICE) {
      return mockKogitoService.getExecutions(workflowId, status);
    }
    const params = new URLSearchParams();
    if (workflowId) params.append('workflowId', workflowId);
    if (status) params.append('status', status);
    
    const response = await fetch(`${this.baseUrl}/executions?${params}`);
    if (!response.ok) throw new Error('Failed to fetch executions');
    return response.json();
  }

  async cancelExecution(executionId: string): Promise<void> {
    if (USE_MOCK_SERVICE) {
      return mockKogitoService.cancelExecution(executionId);
    }
    const response = await fetch(`${this.baseUrl}/executions/${executionId}/cancel`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to cancel execution');
  }

  // A/B Testing
  async getABTests(): Promise<ABTest[]> {
    if (USE_MOCK_SERVICE) {
      return mockKogitoService.getABTests();
    }
    const response = await fetch(`${this.baseUrl}/ab-tests`);
    if (!response.ok) throw new Error('Failed to fetch A/B tests');
    return response.json();
  }

  async getABTest(id: string): Promise<ABTest> {
    if (USE_MOCK_SERVICE) {
      return mockKogitoService.getABTest(id);
    }
    const response = await fetch(`${this.baseUrl}/ab-tests/${id}`);
    if (!response.ok) throw new Error('Failed to fetch A/B test');
    return response.json();
  }

  async createABTest(abTest: Omit<ABTest, 'id' | 'metrics'>): Promise<ABTest> {
    if (USE_MOCK_SERVICE) {
      return mockKogitoService.createABTest(abTest);
    }
    const response = await fetch(`${this.baseUrl}/ab-tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(abTest)
    });
    if (!response.ok) throw new Error('Failed to create A/B test');
    return response.json();
  }

  async updateABTest(id: string, abTest: Partial<ABTest>): Promise<ABTest> {
    if (USE_MOCK_SERVICE) {
      return mockKogitoService.updateABTest(id, abTest);
    }
    const response = await fetch(`${this.baseUrl}/ab-tests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(abTest)
    });
    if (!response.ok) throw new Error('Failed to update A/B test');
    return response.json();
  }

  async startABTest(id: string): Promise<ABTest> {
    if (USE_MOCK_SERVICE) {
      return mockKogitoService.startABTest(id);
    }
    const response = await fetch(`${this.baseUrl}/ab-tests/${id}/start`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to start A/B test');
    return response.json();
  }

  async pauseABTest(id: string): Promise<ABTest> {
    if (USE_MOCK_SERVICE) {
      return mockKogitoService.pauseABTest(id);
    }
    const response = await fetch(`${this.baseUrl}/ab-tests/${id}/pause`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to pause A/B test');
    return response.json();
  }

  async completeABTest(id: string): Promise<ABTest> {
    if (USE_MOCK_SERVICE) {
      return mockKogitoService.completeABTest(id);
    }
    const response = await fetch(`${this.baseUrl}/ab-tests/${id}/complete`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to complete A/B test');
    return response.json();
  }

  async getABTestMetrics(id: string): Promise<ABTestMetrics> {
    if (USE_MOCK_SERVICE) {
      return mockKogitoService.getABTestMetrics(id);
    }
    const response = await fetch(`${this.baseUrl}/ab-tests/${id}/metrics`);
    if (!response.ok) throw new Error('Failed to fetch A/B test metrics');
    return response.json();
  }

  // Process Instances
  async getProcessInstances(): Promise<ProcessInstance[]> {
    if (USE_MOCK_SERVICE) {
      return mockKogitoService.getProcessInstances();
    }
    const response = await fetch(`${this.baseUrl}/process-instances`);
    if (!response.ok) throw new Error('Failed to fetch process instances');
    return response.json();
  }

  async getProcessInstance(id: string): Promise<ProcessInstance> {
    if (USE_MOCK_SERVICE) {
      return mockKogitoService.getProcessInstance(id);
    }
    const response = await fetch(`${this.baseUrl}/process-instances/${id}`);
    if (!response.ok) throw new Error('Failed to fetch process instance');
    return response.json();
  }

  async abortProcessInstance(id: string): Promise<void> {
    if (USE_MOCK_SERVICE) {
      return mockKogitoService.abortProcessInstance(id);
    }
    const response = await fetch(`${this.baseUrl}/process-instances/${id}/abort`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to abort process instance');
  }

  // Task Management
  async getTasks(assignee?: string, status?: string): Promise<TaskInstance[]> {
    if (USE_MOCK_SERVICE) {
      return mockKogitoService.getTasks(assignee, status);
    }
    const params = new URLSearchParams();
    if (assignee) params.append('assignee', assignee);
    if (status) params.append('status', status);
    
    const response = await fetch(`${this.baseUrl}/tasks?${params}`);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  }

  async getTask(id: string): Promise<TaskInstance> {
    if (USE_MOCK_SERVICE) {
      return mockKogitoService.getTask(id);
    }
    const response = await fetch(`${this.baseUrl}/tasks/${id}`);
    if (!response.ok) throw new Error('Failed to fetch task');
    return response.json();
  }

  async claimTask(id: string, assignee: string): Promise<TaskInstance> {
    if (USE_MOCK_SERVICE) {
      return mockKogitoService.claimTask(id, assignee);
    }
    const response = await fetch(`${this.baseUrl}/tasks/${id}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignee })
    });
    if (!response.ok) throw new Error('Failed to claim task');
    return response.json();
  }

  async completeTask(id: string, outputData: Record<string, any>): Promise<TaskInstance> {
    if (USE_MOCK_SERVICE) {
      return mockKogitoService.completeTask(id, outputData);
    }
    const response = await fetch(`${this.baseUrl}/tasks/${id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outputData })
    });
    if (!response.ok) throw new Error('Failed to complete task');
    return response.json();
  }

  // Templates
  async getTemplates(): Promise<WorkflowTemplate[]> {
    if (USE_MOCK_SERVICE) {
      return mockKogitoService.getTemplates();
    }
    const response = await fetch(`${this.baseUrl}/templates`);
    if (!response.ok) throw new Error('Failed to fetch templates');
    return response.json();
  }

  async getTemplate(id: string): Promise<WorkflowTemplate> {
    if (USE_MOCK_SERVICE) {
      return mockKogitoService.getTemplate(id);
    }
    const response = await fetch(`${this.baseUrl}/templates/${id}`);
    if (!response.ok) throw new Error('Failed to fetch template');
    return response.json();
  }

  async createTemplate(template: Omit<WorkflowTemplate, 'id' | 'usageCount' | 'rating' | 'createdAt'>): Promise<WorkflowTemplate> {
    if (USE_MOCK_SERVICE) {
      return mockKogitoService.createTemplate(template);
    }
    const response = await fetch(`${this.baseUrl}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    });
    if (!response.ok) throw new Error('Failed to create template');
    return response.json();
  }
}

export const kogitoService = new KogitoService();