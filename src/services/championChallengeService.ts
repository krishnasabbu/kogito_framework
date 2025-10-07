import { championChallengeApiService, ExecutionResponse } from './championChallengeApiService';
import type { ChampionChallengeExecution, NodeMetric } from '../types/championChallenge';

// Helper to safely parse JSON (handles both string and already-parsed objects)
function safeParse(value: any): any {
  if (!value) return {};
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
  return value;
}

// Helper function to convert API response to frontend format
function mapApiToFrontend(apiResponse: ExecutionResponse): ChampionChallengeExecution {
  const championMetrics: NodeMetric[] = apiResponse.championMetrics.map(metric => ({
    id: metric.id,
    executionId: apiResponse.id,
    variant: 'champion' as const,
    nodeId: metric.nodeId,
    nodeName: metric.nodeName,
    nodeType: metric.nodeType,
    requestData: safeParse(metric.requestData),
    responseData: safeParse(metric.responseData),
    executionTimeMs: metric.executionTimeMs,
    status: metric.status.toLowerCase() as 'success' | 'error' | 'skipped',
    errorMessage: metric.errorMessage || undefined,
    startedAt: new Date(metric.startedAt),
    completedAt: metric.completedAt ? new Date(metric.completedAt) : undefined,
    metadata: safeParse(metric.metadata),
  }));

  const challengeMetrics: NodeMetric[] = apiResponse.challengeMetrics.map(metric => ({
    id: metric.id,
    executionId: apiResponse.id,
    variant: 'challenge' as const,
    nodeId: metric.nodeId,
    nodeName: metric.nodeName,
    nodeType: metric.nodeType,
    requestData: safeParse(metric.requestData),
    responseData: safeParse(metric.responseData),
    executionTimeMs: metric.executionTimeMs,
    status: metric.status.toLowerCase() as 'success' | 'error' | 'skipped',
    errorMessage: metric.errorMessage || undefined,
    startedAt: new Date(metric.startedAt),
    completedAt: metric.completedAt ? new Date(metric.completedAt) : undefined,
    metadata: safeParse(metric.metadata),
  }));

  return {
    id: apiResponse.id,
    name: apiResponse.name,
    description: apiResponse.description,
    championWorkflowId: apiResponse.championWorkflowId,
    challengeWorkflowId: apiResponse.challengeWorkflowId,
    requestPayload: safeParse(apiResponse.requestPayload),
    status: apiResponse.status.toLowerCase() as 'running' | 'completed' | 'failed',
    startedAt: new Date(apiResponse.startedAt),
    completedAt: apiResponse.completedAt ? new Date(apiResponse.completedAt) : undefined,
    createdAt: new Date(apiResponse.createdAt),
    metrics: {
      champion: championMetrics,
      challenge: challengeMetrics,
    },
  };
}

// Mock data generator matching API format
function generateMockExecution(
  name: string,
  description: string,
  championWorkflowId: string,
  challengeWorkflowId: string
): ChampionChallengeExecution {
  const id = `mock-${Date.now()}`;
  const nodes = [
    { id: 'start', name: 'StartEvent', type: 'Event' },
    { id: 'validate', name: 'ServiceTask_ValidateInput', type: 'ServiceTask' },
    { id: 'process', name: 'ServiceTask_ProcessData', type: 'ServiceTask' },
    { id: 'call', name: 'ServiceTask_CallAPI', type: 'ServiceTask' },
    { id: 'gateway', name: 'Gateway_CheckCondition', type: 'Gateway' },
    { id: 'handle', name: 'ServiceTask_HandleResult', type: 'ServiceTask' },
    { id: 'end', name: 'EndEvent', type: 'Event' },
  ];

  const generateMetrics = (variant: 'champion' | 'challenge'): NodeMetric[] => {
    const baseMultiplier = variant === 'champion' ? 1 : 0.8;
    return nodes.map((node, index) => {
      const execTime = Math.floor((Math.random() * 200 + 100) * baseMultiplier);
      const status = Math.random() > 0.95 ? 'error' : 'success';

      return {
        id: `${id}-${variant}-${index}`,
        executionId: id,
        variant,
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
        requestData: { payload: 'test' },
        responseData: { result: status === 'success' ? 'success' : 'error' },
        executionTimeMs: execTime,
        status: status as 'success' | 'error',
        errorMessage: status === 'error' ? `Error in ${node.name}` : undefined,
        startedAt: new Date(Date.now() - execTime),
        completedAt: new Date(),
        metadata: {
          memoryUsed: 20 + Math.random() * 80,
          cpuUsage: 10 + Math.random() * 80,
        },
      };
    });
  };

  return {
    id,
    name,
    description,
    championWorkflowId,
    challengeWorkflowId,
    requestPayload: {},
    status: 'completed',
    startedAt: new Date(Date.now() - 5000),
    completedAt: new Date(),
    createdAt: new Date(Date.now() - 10000),
    metrics: {
      champion: generateMetrics('champion'),
      challenge: generateMetrics('challenge'),
    },
  };
}

function generateMockExecutions(): ChampionChallengeExecution[] {
  return [
    generateMockExecution(
      'Payment Flow Performance Test',
      'Testing payment processing speed',
      'payment-v1',
      'payment-v2'
    ),
    generateMockExecution(
      'Order Fulfillment Comparison',
      'Comparing order workflows',
      'order-v1',
      'order-v2'
    ),
  ];
}

export class ChampionChallengeService {
  private useBackend: boolean = true;
  private mockExecutions: ChampionChallengeExecution[] = generateMockExecutions();

  async executeComparison(
    championWorkflowId: string,
    challengeWorkflowId: string,
    requestPayload: any,
    name: string,
    description?: string
  ): Promise<ChampionChallengeExecution> {
    if (this.useBackend) {
      try {
        const apiResponse = await championChallengeApiService.createExecution(
          name,
          description || '',
          championWorkflowId,
          challengeWorkflowId,
          requestPayload
        );
        return mapApiToFrontend(apiResponse);
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }

    const mockExecution = generateMockExecution(
      name,
      description || '',
      championWorkflowId,
      challengeWorkflowId
    );
    this.mockExecutions.unshift(mockExecution);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockExecution;
  }

  async loadExecution(executionId: string): Promise<ChampionChallengeExecution | null> {
    if (this.useBackend) {
      try {
        const apiResponse = await championChallengeApiService.getExecution(executionId);
        return mapApiToFrontend(apiResponse);
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }

    const mockExecution = this.mockExecutions.find(e => e.id === executionId);
    return mockExecution || null;
  }

  async listExecutions(): Promise<ChampionChallengeExecution[]> {
    if (this.useBackend) {
      try {
        const apiResponses = await championChallengeApiService.listExecutions();
        return apiResponses.map(mapApiToFrontend);
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }

    return this.mockExecutions;
  }

  resetToBackend() {
    this.useBackend = true;
  }
}

export const championChallengeService = new ChampionChallengeService();
