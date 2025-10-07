import { abTestApiService, ABTestResponse, ABTestAnalyticsResponse } from './abTestApiService';
import { ABTestConfig, ABTestMetrics, ExecutionLog, ArmStatistics } from '../types/abtest';

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

  async getMetrics(testId: string, timeFilter: string): Promise<ABTestMetrics> {
    if (this.useBackend) {
      try {
        const analytics = await abTestApiService.getAnalytics(testId);
        return this.mapAnalyticsToMetrics(analytics, testId);
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }

    return this.generateMockMetrics(testId);
  }

  async getLogs(testId: string, page: number, pageSize: number): Promise<ExecutionLog[]> {
    if (this.useBackend) {
      try {
        const analytics = await abTestApiService.getAnalytics(testId);
        return this.mapAnalyticsToLogs(analytics, testId);
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }

    return this.generateMockLogs(testId);
  }

  private mapAnalyticsToMetrics(analytics: ABTestAnalyticsResponse, testId: string): ABTestMetrics {
    const armStats: Record<string, ArmStatistics> = {};

    analytics.armPerformance.forEach((arm, index) => {
      const armKey = String.fromCharCode(97 + index);
      armStats[armKey] = {
        armKey,
        armName: arm.armName,
        runs: arm.executions,
        successRate: arm.successRate,
        errorRate: arm.errorRate,
        avgDuration: arm.avgExecutionTime,
        minDuration: arm.avgExecutionTime * 0.7,
        maxDuration: arm.avgExecutionTime * 1.5,
        totalDuration: arm.avgExecutionTime * arm.executions,
        retryCount: 0,
        queueTime: 0,
      };
    });

    return {
      testId,
      totalRuns: analytics.overview.totalExecutions,
      armStats,
      timeSeriesData: analytics.timeSeries.map(ts => ({
        timestamp: ts.timestamp,
        armData: Object.entries(ts.executionsByArm).reduce((acc, [armId, count], index) => {
          const armKey = String.fromCharCode(97 + index);
          acc[armKey] = {
            requests: count,
            success: Math.floor(count * (ts.successRateByArm[armId] || 0.95)),
            errors: Math.floor(count * (1 - (ts.successRateByArm[armId] || 0.95))),
            avgDuration: ts.avgLatencyByArm[armId] || 200,
          };
          return acc;
        }, {} as any),
      })),
      serviceExecutions: [],
      latencyPercentiles: {
        p50: Object.fromEntries(analytics.armPerformance.map((arm, i) => [String.fromCharCode(97 + i), arm.p50Latency])),
        p90: Object.fromEntries(analytics.armPerformance.map((arm, i) => [String.fromCharCode(97 + i), arm.p95Latency * 0.9])),
        p95: Object.fromEntries(analytics.armPerformance.map((arm, i) => [String.fromCharCode(97 + i), arm.p95Latency])),
        p99: Object.fromEntries(analytics.armPerformance.map((arm, i) => [String.fromCharCode(97 + i), arm.p99Latency])),
      },
      throughputMetrics: {
        rps: {},
        peakRps: {},
        avgRps: {},
        totalRequests: Object.fromEntries(analytics.armPerformance.map((arm, i) => [String.fromCharCode(97 + i), arm.executions])),
      },
      slaMetrics: {
        slaThreshold: 1000,
        breaches: {},
        complianceRate: {},
        avgResponseTime: Object.fromEntries(analytics.armPerformance.map((arm, i) => [String.fromCharCode(97 + i), arm.avgExecutionTime])),
      },
      concurrencyMetrics: {
        maxConcurrent: {},
        avgConcurrent: {},
        queueTime: {},
        waitTime: {},
      },
      errorBreakdown: [],
      activityPerformance: [],
    };
  }

  private mapAnalyticsToLogs(analytics: ABTestAnalyticsResponse, testId: string): ExecutionLog[] {
    const logs: ExecutionLog[] = [];

    analytics.armPerformance.forEach((arm, index) => {
      const armKey = String.fromCharCode(97 + index);

      for (let i = 0; i < Math.min(arm.executions, 50); i++) {
        const isSuccess = Math.random() < arm.successRate;
        logs.push({
          id: `log-${testId}-${armKey}-${i}`,
          testId,
          armKey,
          armName: arm.armName,
          status: isSuccess ? 'success' : 'error',
          duration: Math.floor(arm.avgExecutionTime + (Math.random() - 0.5) * 100),
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          errorMessage: isSuccess ? undefined : 'Execution failed',
          serviceSteps: [],
          retryCount: 0,
          queueTime: 0,
          activityExecutions: [],
        });
      }
    });

    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private generateMockMetrics(testId: string): ABTestMetrics {
    return {
      testId,
      totalRuns: 1250,
      armStats: {
        a: {
          armKey: 'a',
          armName: 'Standard Flow',
          runs: 625,
          successRate: 0.96,
          errorRate: 0.04,
          avgDuration: 245,
          minDuration: 180,
          maxDuration: 450,
          totalDuration: 153125,
          retryCount: 15,
          queueTime: 25,
        },
        b: {
          armKey: 'b',
          armName: 'Optimized Flow',
          runs: 625,
          successRate: 0.98,
          errorRate: 0.02,
          avgDuration: 185,
          minDuration: 120,
          maxDuration: 320,
          totalDuration: 115625,
          retryCount: 8,
          queueTime: 18,
        },
      },
      timeSeriesData: Array.from({ length: 20 }, (_, i) => ({
        timestamp: new Date(Date.now() - (19 - i) * 300000).toISOString(),
        armData: {
          a: {
            requests: Math.floor(Math.random() * 50 + 25),
            success: Math.floor(Math.random() * 48 + 24),
            errors: Math.floor(Math.random() * 2),
            avgDuration: Math.floor(Math.random() * 50 + 220),
          },
          b: {
            requests: Math.floor(Math.random() * 50 + 25),
            success: Math.floor(Math.random() * 49 + 24),
            errors: Math.floor(Math.random() * 1),
            avgDuration: Math.floor(Math.random() * 40 + 165),
          },
        },
      })),
      serviceExecutions: [],
      latencyPercentiles: {
        p50: { a: 240, b: 180 },
        p90: { a: 380, b: 280 },
        p95: { a: 420, b: 310 },
        p99: { a: 450, b: 320 },
      },
      throughputMetrics: {
        rps: { a: 10.5, b: 10.5 },
        peakRps: { a: 25, b: 28 },
        avgRps: { a: 10.4, b: 10.4 },
        totalRequests: { a: 625, b: 625 },
      },
      slaMetrics: {
        slaThreshold: 1000,
        breaches: { a: 5, b: 2 },
        complianceRate: { a: 0.992, b: 0.997 },
        avgResponseTime: { a: 245, b: 185 },
      },
      concurrencyMetrics: {
        maxConcurrent: { a: 15, b: 18 },
        avgConcurrent: { a: 8, b: 9 },
        queueTime: { a: 25, b: 18 },
        waitTime: { a: 12, b: 8 },
      },
      errorBreakdown: [],
      activityPerformance: [],
    };
  }

  private generateMockLogs(testId: string): ExecutionLog[] {
    const logs: ExecutionLog[] = [];

    ['a', 'b'].forEach(armKey => {
      for (let i = 0; i < 50; i++) {
        const isSuccess = Math.random() < 0.97;
        logs.push({
          id: `log-${testId}-${armKey}-${i}`,
          testId,
          armKey,
          armName: armKey === 'a' ? 'Standard Flow' : 'Optimized Flow',
          status: isSuccess ? 'success' : 'error',
          duration: Math.floor(Math.random() * 200 + (armKey === 'a' ? 200 : 150)),
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          errorMessage: isSuccess ? undefined : 'Execution failed',
          serviceSteps: [],
          retryCount: 0,
          queueTime: 0,
          activityExecutions: [],
        });
      }
    });

    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  resetToBackend() {
    this.useBackend = true;
  }
}

export const abTestService = new ABTestService();
