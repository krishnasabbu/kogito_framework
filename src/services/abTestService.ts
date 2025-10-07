import { abTestApiService, ABTestResponse } from './abTestApiService';
import { ABTestConfig } from '../types/abtest';

// Helper to map backend response to frontend
function mapBackendToFrontend(backendTest: ABTestResponse): ABTestConfig {
  return {
    id: backendTest.id,
    name: backendTest.name,
    description: backendTest.description,
    springProjectPath: '/project',
    workflowId: backendTest.workflowId,
    arms: backendTest.arms.map((arm, index) => ({
      armKey: String.fromCharCode(97 + index), // 'a', 'b', 'c'...
      armName: arm.name,
      bpmnFile: arm.bpmnFilePath,
      processDefinitionKey: arm.id,
      customLabel: arm.description,
      trafficPercentage: arm.trafficPercentage,
      isControl: arm.isControl,
    })),
    trafficSplit: backendTest.trafficSplit,
    status: backendTest.status.toLowerCase(),
    generateListener: false,
    createdAt: backendTest.createdAt,
    updatedAt: backendTest.createdAt,
  };
}

// Mock data generator matching API format
function generateMockTest(name: string, description: string, workflowId: string, arms: any[]): ABTestConfig {
  return {
    id: `mock-${Date.now()}`,
    name,
    description,
    springProjectPath: '/project',
    workflowId,
    arms: arms.map((arm, index) => ({
      armKey: String.fromCharCode(97 + index),
      armName: arm.name,
      bpmnFile: arm.bpmnFilePath,
      processDefinitionKey: `process-${index}`,
      customLabel: arm.description,
      trafficPercentage: arm.trafficPercentage,
      isControl: arm.isControl,
    })),
    trafficSplit: 50,
    status: 'draft',
    generateListener: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function generateMockTests(): ABTestConfig[] {
  return [
    {
      id: 'mock-test-1',
      name: 'Order Processing Optimization',
      description: 'Testing standard vs optimized order processing flow',
      springProjectPath: '/project',
      workflowId: 'order-processing',
      arms: [
        {
          armKey: 'a',
          armName: 'Standard Flow',
          bpmnFile: 'order-processing-v1.bpmn',
          processDefinitionKey: 'order_processing_v1',
          trafficPercentage: 50,
          isControl: true,
        },
        {
          armKey: 'b',
          armName: 'Optimized Flow',
          bpmnFile: 'order-processing-v2.bpmn',
          processDefinitionKey: 'order_processing_v2',
          trafficPercentage: 50,
          isControl: false,
        },
      ],
      trafficSplit: 50,
      status: 'running',
      generateListener: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'mock-test-2',
      name: 'Payment Gateway Comparison',
      description: 'Comparing different payment gateway implementations',
      springProjectPath: '/project',
      workflowId: 'payment-gateway',
      arms: [
        {
          armKey: 'a',
          armName: 'Gateway A',
          bpmnFile: 'payment-flow-standard.bpmn',
          processDefinitionKey: 'payment_flow_standard',
          trafficPercentage: 50,
          isControl: true,
        },
        {
          armKey: 'b',
          armName: 'Gateway B',
          bpmnFile: 'payment-flow-optimized.bpmn',
          processDefinitionKey: 'payment_flow_optimized',
          trafficPercentage: 50,
          isControl: false,
        },
      ],
      trafficSplit: 50,
      status: 'stopped',
      generateListener: true,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ];
}

export class ABTestService {
  private useBackend: boolean = true;
  private mockTests: ABTestConfig[] = generateMockTests();

  async getAllTests(): Promise<ABTestConfig[]> {
    if (this.useBackend) {
      try {
        const response = await abTestApiService.getAllABTests();
        return response.map(mapBackendToFrontend);
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }

    return this.mockTests;
  }

  async getTest(testId: string): Promise<ABTestConfig | null> {
    if (this.useBackend) {
      try {
        const response = await abTestApiService.getABTest(testId);
        return mapBackendToFrontend(response);
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }

    const test = this.mockTests.find(t => t.id === testId);
    return test || null;
  }

  async createTest(testData: Omit<ABTestConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ABTestConfig> {
    if (this.useBackend) {
      try {
        const createRequest = {
          name: testData.name,
          description: testData.description || '',
          workflowId: testData.workflowId || testData.name.toLowerCase().replace(/\s+/g, '-'),
          trafficSplit: testData.trafficSplit,
          hypothesis: 'Testing workflow performance',
          successMetric: 'execution_time',
          minimumSampleSize: 100,
          confidenceLevel: 0.95,
          arms: testData.arms.map(arm => ({
            name: arm.armName,
            description: arm.customLabel || arm.armName,
            bpmnFilePath: arm.bpmnFile,
            trafficPercentage: arm.trafficPercentage || 50,
            isControl: arm.isControl || false,
          })),
        };

        const response = await abTestApiService.createABTest(createRequest);
        return mapBackendToFrontend(response);
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }

    const mockTest = generateMockTest(
      testData.name,
      testData.description || '',
      testData.workflowId || testData.name.toLowerCase().replace(/\s+/g, '-'),
      testData.arms
    );
    this.mockTests.unshift(mockTest);
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTest;
  }

  async startTest(testId: string): Promise<ABTestConfig> {
    if (this.useBackend) {
      try {
        const response = await abTestApiService.startABTest(testId);
        return mapBackendToFrontend(response);
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }

    const test = this.mockTests.find(t => t.id === testId);
    if (test) {
      test.status = 'running';
      test.updatedAt = new Date().toISOString();
    }
    await new Promise(resolve => setTimeout(resolve, 300));
    return test!;
  }

  async stopTest(testId: string): Promise<ABTestConfig> {
    if (this.useBackend) {
      try {
        const response = await abTestApiService.stopABTest(testId);
        return mapBackendToFrontend(response);
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }

    const test = this.mockTests.find(t => t.id === testId);
    if (test) {
      test.status = 'stopped';
      test.updatedAt = new Date().toISOString();
    }
    await new Promise(resolve => setTimeout(resolve, 300));
    return test!;
  }

  async deleteTest(testId: string): Promise<void> {
    if (this.useBackend) {
      try {
        // Backend doesn't have delete, so just remove from local state
        this.mockTests = this.mockTests.filter(t => t.id !== testId);
        return;
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }

    this.mockTests = this.mockTests.filter(t => t.id !== testId);
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  resetToBackend() {
    this.useBackend = true;
  }
}

export const abTestService = new ABTestService();
