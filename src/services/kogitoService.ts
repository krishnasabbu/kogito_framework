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

class KogitoService {
  private baseUrl = '/api/kogito';
  private useBackend: boolean = true;

  // Workflow Management
  async getWorkflows(): Promise<WorkflowDefinition[]> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.baseUrl}/workflows`);
        if (!response.ok) throw new Error('Failed to fetch workflows');
        return await response.json();
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }
    return mockKogitoService.getWorkflows();
  }

  async getWorkflow(id: string): Promise<WorkflowDefinition> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.baseUrl}/workflows/${id}`);
        if (!response.ok) throw new Error('Failed to fetch workflow');
        return await response.json();
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }
    return mockKogitoService.getWorkflow(id);
  }

  async createWorkflow(workflow: Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkflowDefinition> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.baseUrl}/workflows`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(workflow)
        });
        if (!response.ok) throw new Error('Failed to create workflow');
        return await response.json();
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }
    return mockKogitoService.createWorkflow(workflow);
  }

  async updateWorkflow(id: string, workflow: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.baseUrl}/workflows/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(workflow)
        });
        if (!response.ok) throw new Error('Failed to update workflow');
        return await response.json();
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }
    return mockKogitoService.updateWorkflow(id, workflow);
  }

  async deleteWorkflow(id: string): Promise<void> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.baseUrl}/workflows/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete workflow');
        return;
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }
    return mockKogitoService.deleteWorkflow(id);
  }

  async validateWorkflow(bpmnContent: string, dmnContent?: string): Promise<WorkflowValidationResult> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.baseUrl}/workflows/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bpmnContent, dmnContent })
        });
        if (!response.ok) throw new Error('Failed to validate workflow');
        return await response.json();
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }
    return mockKogitoService.validateWorkflow(bpmnContent, dmnContent);
  }

  // Workflow Execution
  async executeWorkflow(workflowId: string, inputData: Record<string, any>, abTestId?: string): Promise<WorkflowExecution> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.baseUrl}/workflows/${workflowId}/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inputData, abTestId })
        });
        if (!response.ok) throw new Error('Failed to execute workflow');
        return await response.json();
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }
    return mockKogitoService.executeWorkflow(workflowId, inputData, abTestId);
  }

  async getExecution(executionId: string): Promise<WorkflowExecution> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.baseUrl}/executions/${executionId}`);
        if (!response.ok) throw new Error('Failed to fetch execution');
        return await response.json();
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }
    return mockKogitoService.getExecution(executionId);
  }

  async getExecutions(workflowId?: string, status?: string): Promise<WorkflowExecution[]> {
    if (this.useBackend) {
      try {
        const params = new URLSearchParams();
        if (workflowId) params.append('workflowId', workflowId);
        if (status) params.append('status', status);

        const response = await fetch(`${this.baseUrl}/executions?${params}`);
        if (!response.ok) throw new Error('Failed to fetch executions');
        return await response.json();
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }
    return mockKogitoService.getExecutions(workflowId, status);
  }

  async cancelExecution(executionId: string): Promise<void> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.baseUrl}/executions/${executionId}/cancel`, {
          method: 'POST'
        });
        if (!response.ok) throw new Error('Failed to cancel execution');
        return;
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }
    return mockKogitoService.cancelExecution(executionId);
  }

  // A/B Testing
  async getABTests(): Promise<ABTest[]> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.baseUrl}/ab-tests`);
        if (!response.ok) throw new Error('Failed to fetch A/B tests');
        return await response.json();
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }
    return mockKogitoService.getABTests();
  }

  async getABTest(id: string): Promise<ABTest> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.baseUrl}/ab-tests/${id}`);
        if (!response.ok) throw new Error('Failed to fetch A/B test');
        return await response.json();
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }
    return mockKogitoService.getABTest(id);
  }

  async createABTest(abTest: Omit<ABTest, 'id' | 'metrics'>): Promise<ABTest> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.baseUrl}/ab-tests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(abTest)
        });
        if (!response.ok) throw new Error('Failed to create A/B test');
        return await response.json();
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }
    return mockKogitoService.createABTest(abTest);
  }

  async updateABTest(id: string, abTest: Partial<ABTest>): Promise<ABTest> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.baseUrl}/ab-tests/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(abTest)
        });
        if (!response.ok) throw new Error('Failed to update A/B test');
        return await response.json();
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }
    return mockKogitoService.updateABTest(id, abTest);
  }

  async startABTest(id: string): Promise<ABTest> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.baseUrl}/ab-tests/${id}/start`, {
          method: 'POST'
        });
        if (!response.ok) throw new Error('Failed to start A/B test');
        return await response.json();
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }
    return mockKogitoService.startABTest(id);
  }

  async pauseABTest(id: string): Promise<ABTest> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.baseUrl}/ab-tests/${id}/pause`, {
          method: 'POST'
        });
        if (!response.ok) throw new Error('Failed to pause A/B test');
        return await response.json();
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }
    return mockKogitoService.pauseABTest(id);
  }

  async completeABTest(id: string): Promise<ABTest> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.baseUrl}/ab-tests/${id}/complete`, {
          method: 'POST'
        });
        if (!response.ok) throw new Error('Failed to complete A/B test');
        return await response.json();
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }
    return mockKogitoService.completeABTest(id);
  }

  async getABTestMetrics(id: string): Promise<ABTestMetrics> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.baseUrl}/ab-tests/${id}/metrics`);
        if (!response.ok) throw new Error('Failed to fetch A/B test metrics');
        return await response.json();
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }
    return mockKogitoService.getABTestMetrics(id);
  }

  // Process Instances
  async getProcessInstances(): Promise<ProcessInstance[]> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.baseUrl}/process-instances`);
        if (!response.ok) throw new Error('Failed to fetch process instances');
        return await response.json();
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }
    return mockKogitoService.getProcessInstances();
  }

  async getProcessInstance(id: string): Promise<ProcessInstance> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.baseUrl}/process-instances/${id}`);
        if (!response.ok) throw new Error('Failed to fetch process instance');
        return await response.json();
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }
    return mockKogitoService.getProcessInstance(id);
  }

  async abortProcessInstance(id: string): Promise<void> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.baseUrl}/process-instances/${id}/abort`, {
          method: 'POST'
        });
        if (!response.ok) throw new Error('Failed to abort process instance');
        return;
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }
    return mockKogitoService.abortProcessInstance(id);
  }

  // Task Management
  async getTasks(assignee?: string, status?: string): Promise<TaskInstance[]> {
    if (this.useBackend) {
      try {
        const params = new URLSearchParams();
        if (assignee) params.append('assignee', assignee);
        if (status) params.append('status', status);

        const response = await fetch(`${this.baseUrl}/tasks?${params}`);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        return await response.json();
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }
    return mockKogitoService.getTasks(assignee, status);
  }

  async getTask(id: string): Promise<TaskInstance> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.baseUrl}/tasks/${id}`);
        if (!response.ok) throw new Error('Failed to fetch task');
        return await response.json();
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }
    return mockKogitoService.getTask(id);
  }

  async claimTask(id: string, assignee: string): Promise<TaskInstance> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.baseUrl}/tasks/${id}/claim`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assignee })
        });
        if (!response.ok) throw new Error('Failed to claim task');
        return await response.json();
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }
    return mockKogitoService.claimTask(id, assignee);
  }

  async completeTask(id: string, outputData: Record<string, any>): Promise<TaskInstance> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.baseUrl}/tasks/${id}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ outputData })
        });
        if (!response.ok) throw new Error('Failed to complete task');
        return await response.json();
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }
    return mockKogitoService.completeTask(id, outputData);
  }

  // Templates
  async getTemplates(): Promise<WorkflowTemplate[]> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.baseUrl}/templates`);
        if (!response.ok) throw new Error('Failed to fetch templates');
        return await response.json();
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }
    return mockKogitoService.getTemplates();
  }

  async getTemplate(id: string): Promise<WorkflowTemplate> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.baseUrl}/templates/${id}`);
        if (!response.ok) throw new Error('Failed to fetch template');
        return await response.json();
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }
    return mockKogitoService.getTemplate(id);
  }

  async createTemplate(template: Omit<WorkflowTemplate, 'id' | 'usageCount' | 'rating' | 'createdAt'>): Promise<WorkflowTemplate> {
    if (this.useBackend) {
      try {
        const response = await fetch(`${this.baseUrl}/templates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(template)
        });
        if (!response.ok) throw new Error('Failed to create template');
        return await response.json();
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }
    return mockKogitoService.createTemplate(template);
  }

  resetToBackend() {
    this.useBackend = true;
  }
}

export const kogitoService = new KogitoService();
