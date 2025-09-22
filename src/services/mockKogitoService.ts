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

// Mock data
const mockWorkflows: WorkflowDefinition[] = [
  {
    id: 'wf-1',
    name: 'Order Processing Workflow',
    description: 'Handles customer order processing from creation to fulfillment',
    version: '1.0.0',
    status: 'active',
    bpmnContent: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn2:process id="Process_1" isExecutable="true">
    <bpmn2:startEvent id="StartEvent_1"/>
  </bpmn2:process>
</bpmn2:definitions>`,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString(),
    createdBy: 'admin',
    tags: ['order', 'processing', 'ecommerce'],
    variables: []
  },
  {
    id: 'wf-2',
    name: 'Payment Processing Workflow',
    description: 'Secure payment processing with fraud detection',
    version: '2.1.0',
    status: 'active',
    bpmnContent: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" id="payment-diagram" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn2:process id="PaymentProcess" isExecutable="true">
    <bpmn2:startEvent id="StartEvent_1"/>
  </bpmn2:process>
</bpmn2:definitions>`,
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-25').toISOString(),
    createdBy: 'payment-team',
    tags: ['payment', 'fraud-detection', 'security'],
    variables: []
  }
];

const mockExecutions: WorkflowExecution[] = [
  {
    id: 'exec-1',
    workflowId: 'wf-1',
    workflowVersion: '1.0.0',
    status: 'completed',
    startTime: new Date('2024-01-25T10:00:00Z').toISOString(),
    endTime: new Date('2024-01-25T10:05:30Z').toISOString(),
    duration: 330,
    inputData: { orderId: 'ORD-12345', customerId: 'CUST-789' },
    outputData: { status: 'processed', trackingNumber: 'TRK-98765' },
    executionTrace: [],
    abTestId: 'ab-1'
  },
  {
    id: 'exec-2',
    workflowId: 'wf-2',
    workflowVersion: '2.1.0',
    status: 'running',
    startTime: new Date('2024-01-25T11:30:00Z').toISOString(),
    inputData: { amount: 299.99, currency: 'USD', paymentMethod: 'credit_card' },
    executionTrace: []
  }
];

const mockABTests: ABTest[] = [
  {
    id: 'ab-1',
    name: 'Order Processing Optimization',
    description: 'Testing optimized order processing flow vs standard flow',
    workflowAId: 'wf-1',
    workflowBId: 'wf-1-optimized',
    trafficSplit: 50,
    status: 'running',
    startDate: new Date('2024-01-20').toISOString(),
    createdBy: 'admin',
    criteria: {
      primaryMetric: 'success_rate',
      minimumSampleSize: 1000,
      confidenceLevel: 0.95,
      minimumDetectableEffect: 0.05,
      maxDurationDays: 30
    },
    metrics: {
      totalExecutions: 2450,
      groupAExecutions: 1225,
      groupBExecutions: 1225,
      groupASuccessRate: 0.94,
      groupBSuccessRate: 0.97,
      groupAAvgDuration: 5.2,
      groupBAvgDuration: 4.8,
      groupAErrorRate: 0.06,
      groupBErrorRate: 0.03,
      confidenceLevel: 0.95,
      statisticalSignificance: 0.95
    }
  }
];

const mockProcessInstances: ProcessInstance[] = [
  {
    id: 'pi-1',
    processId: 'wf-1',
    processVersion: '1.0.0',
    status: 'active',
    startDate: new Date('2024-01-25T12:00:00Z').toISOString(),
    variables: { orderId: 'ORD-12346', status: 'processing' }
  }
];

const mockTasks: TaskInstance[] = [
  {
    id: 'task-1',
    name: 'Review Order',
    processInstanceId: 'pi-1',
    assignee: 'john.doe',
    candidateGroups: ['reviewers', 'managers'],
    status: 'ready',
    priority: 5,
    createdDate: new Date('2024-01-25T12:05:00Z').toISOString(),
    inputData: { orderId: 'ORD-12346', customerTier: 'premium' }
  }
];

const mockTemplates: WorkflowTemplate[] = [
  {
    id: 'tpl-1',
    name: 'E-commerce Order Flow',
    description: 'Standard e-commerce order processing template',
    category: 'E-commerce',
    bpmnContent: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" id="template-diagram" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn2:process id="EcommerceProcess" isExecutable="true">
    <bpmn2:startEvent id="StartEvent_1"/>
  </bpmn2:process>
</bpmn2:definitions>`,
    variables: [],
    tags: ['ecommerce', 'order', 'template'],
    isPublic: true,
    usageCount: 45,
    rating: 4.7,
    createdAt: new Date('2024-01-01T00:00:00Z').toISOString(),
    createdBy: 'template-admin',
  }
];

class MockKogitoService {
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Workflow Management
  async getWorkflows(): Promise<WorkflowDefinition[]> {
    await this.delay(500);
    return [...mockWorkflows];
  }

  async getWorkflow(id: string): Promise<WorkflowDefinition> {
    await this.delay(300);
    const workflow = mockWorkflows.find(w => w.id === id);
    if (!workflow) throw new Error('Workflow not found');
    return workflow;
  }

  async createWorkflow(workflow: Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkflowDefinition> {
    await this.delay(800);
    const newWorkflow: WorkflowDefinition = {
      ...workflow,
      id: `wf-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockWorkflows.push(newWorkflow);
    console.log('Created workflow:', newWorkflow);
    return newWorkflow;
  }

  async updateWorkflow(id: string, workflow: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> {
    await this.delay(600);
    const index = mockWorkflows.findIndex(w => w.id === id);
    if (index === -1) throw new Error('Workflow not found');
    
    mockWorkflows[index] = { ...mockWorkflows[index], ...workflow, updatedAt: new Date().toISOString() };
    console.log('Updated workflow:', mockWorkflows[index]);
    return mockWorkflows[index];
  }

  async deleteWorkflow(id: string): Promise<void> {
    await this.delay(400);
    const index = mockWorkflows.findIndex(w => w.id === id);
    if (index === -1) throw new Error('Workflow not found');
    mockWorkflows.splice(index, 1);
  }

  async validateWorkflow(bpmnContent: string, dmnContent?: string): Promise<WorkflowValidationResult> {
    await this.delay(1000);
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }

  // Workflow Execution
  async executeWorkflow(workflowId: string, inputData: Record<string, any>, abTestId?: string): Promise<WorkflowExecution> {
    await this.delay(1200);
    const execution: WorkflowExecution = {
      id: `exec-${Date.now()}`,
      workflowId,
      workflowVersion: '1.0.0',
      status: 'running',
      startTime: new Date().toISOString(),
      inputData,
      executionTrace: [],
      abTestId
    };
    mockExecutions.unshift(execution);
    
    // Simulate completion after a delay
    setTimeout(() => {
      execution.status = 'completed';
      execution.endTime = new Date().toISOString();
      execution.outputData = { result: 'success', processedAt: new Date().toISOString() };
    }, 3000);
    
    return execution;
  }

  async getExecution(executionId: string): Promise<WorkflowExecution> {
    await this.delay(200);
    const execution = mockExecutions.find(e => e.id === executionId);
    if (!execution) throw new Error('Execution not found');
    return execution;
  }

  async getExecutions(workflowId?: string, status?: string): Promise<WorkflowExecution[]> {
    await this.delay(400);
    let filtered = [...mockExecutions];
    
    if (workflowId) {
      filtered = filtered.filter(e => e.workflowId === workflowId);
    }
    
    if (status) {
      filtered = filtered.filter(e => e.status === status);
    }
    
    return filtered;
  }

  async cancelExecution(executionId: string): Promise<void> {
    await this.delay(300);
    const execution = mockExecutions.find(e => e.id === executionId);
    if (execution) {
      execution.status = 'cancelled';
      execution.endTime = new Date().toISOString();
    }
  }

  // A/B Testing
  async getABTests(): Promise<ABTest[]> {
    await this.delay(500);
    return [...mockABTests];
  }

  async getABTest(id: string): Promise<ABTest> {
    await this.delay(300);
    const abTest = mockABTests.find(t => t.id === id);
    if (!abTest) throw new Error('A/B test not found');
    return abTest;
  }

  async createABTest(abTest: Omit<ABTest, 'id' | 'metrics'>): Promise<ABTest> {
    await this.delay(800);
    const newABTest: ABTest = {
      ...abTest,
      id: `ab-${Date.now()}`,
      metrics: {
        totalExecutions: 0,
        groupAExecutions: 0,
        groupBExecutions: 0,
        groupASuccessRate: 0,
        groupBSuccessRate: 0,
        groupAAvgDuration: 0,
        groupBAvgDuration: 0,
        groupAErrorRate: 0,
        groupBErrorRate: 0,
        confidenceLevel: 0,
        statisticalSignificance: false
      }
    };
    mockABTests.push(newABTest);
    return newABTest;
  }

  async updateABTest(id: string, abTest: Partial<ABTest>): Promise<ABTest> {
    await this.delay(600);
    const index = mockABTests.findIndex(t => t.id === id);
    if (index === -1) throw new Error('A/B test not found');
    
    mockABTests[index] = { ...mockABTests[index], ...abTest };
    return mockABTests[index];
  }

  async startABTest(id: string): Promise<ABTest> {
    await this.delay(400);
    const abTest = mockABTests.find(t => t.id === id);
    if (!abTest) throw new Error('A/B test not found');
    
    abTest.status = 'running';
    abTest.startDate = new Date().toISOString();
    return abTest;
  }

  async pauseABTest(id: string): Promise<ABTest> {
    await this.delay(400);
    const abTest = mockABTests.find(t => t.id === id);
    if (!abTest) throw new Error('A/B test not found');
    
    abTest.status = 'paused';
    return abTest;
  }

  async completeABTest(id: string): Promise<ABTest> {
    await this.delay(400);
    const abTest = mockABTests.find(t => t.id === id);
    if (!abTest) throw new Error('A/B test not found');
    
    abTest.status = 'completed';
    abTest.endDate = new Date().toISOString();
    return abTest;
  }

  async getABTestMetrics(id: string): Promise<ABTestMetrics> {
    await this.delay(600);
    const abTest = mockABTests.find(t => t.id === id);
    if (!abTest || !abTest.metrics) throw new Error('A/B test metrics not found');
    return abTest.metrics;
  }

  // Process Instances
  async getProcessInstances(): Promise<ProcessInstance[]> {
    await this.delay(400);
    return [...mockProcessInstances];
  }

  async getProcessInstance(id: string): Promise<ProcessInstance> {
    await this.delay(200);
    const instance = mockProcessInstances.find(p => p.id === id);
    if (!instance) throw new Error('Process instance not found');
    return instance;
  }

  async abortProcessInstance(id: string): Promise<void> {
    await this.delay(300);
    const instance = mockProcessInstances.find(p => p.id === id);
    if (instance) {
      instance.status = 'aborted';
      instance.endTime = new Date().toISOString();
    }
  }

  // Task Management
  async getTasks(assignee?: string, status?: string): Promise<TaskInstance[]> {
    await this.delay(400);
    let filtered = [...mockTasks];
    
    if (assignee) {
      filtered = filtered.filter(t => t.assignee === assignee);
    }
    
    if (status) {
      filtered = filtered.filter(t => t.status === status);
    }
    
    return filtered;
  }

  async getTask(id: string): Promise<TaskInstance> {
    await this.delay(200);
    const task = mockTasks.find(t => t.id === id);
    if (!task) throw new Error('Task not found');
    return task;
  }

  async claimTask(id: string, assignee: string): Promise<TaskInstance> {
    await this.delay(300);
    const task = mockTasks.find(t => t.id === id);
    if (!task) throw new Error('Task not found');
    
    task.assignee = assignee;
    task.status = 'reserved';
    return task;
  }

  async completeTask(id: string, outputData: Record<string, any>): Promise<TaskInstance> {
    await this.delay(500);
    const task = mockTasks.find(t => t.id === id);
    if (!task) throw new Error('Task not found');
    
    task.status = 'completed';
    task.completedDate = new Date().toISOString();
    task.outputData = outputData;
    return task;
  }

  // Templates
  async getTemplates(): Promise<WorkflowTemplate[]> {
    await this.delay(400);
    return [...mockTemplates];
  }

  async getTemplate(id: string): Promise<WorkflowTemplate> {
    await this.delay(200);
    const template = mockTemplates.find(t => t.id === id);
    if (!template) throw new Error('Template not found');
    return template;
  }

  async createTemplate(template: Omit<WorkflowTemplate, 'id' | 'usageCount' | 'rating' | 'createdAt'>): Promise<WorkflowTemplate> {
    await this.delay(800);
    const newTemplate: WorkflowTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
      usageCount: 0,
      rating: 0,
      createdAt: new Date().toISOString()
    };
    mockTemplates.push(newTemplate);
    return newTemplate;
  }
}

export const mockKogitoService = new MockKogitoService();