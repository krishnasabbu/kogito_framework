import { championChallengeApiService, ComparisonResponse, ExecutionResponse } from './championChallengeApiService';
import type { ChampionChallengeComparison, ChampionChallengeExecution, NodeMetric } from '../types/championChallenge';

// Helper to safely parse JSON
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

// Map API comparison to frontend
function mapApiComparisonToFrontend(apiResponse: ComparisonResponse): ChampionChallengeComparison {
  return {
    id: apiResponse.id,
    name: apiResponse.name,
    description: apiResponse.description,
    championWorkflowId: apiResponse.championWorkflowId,
    challengeWorkflowId: apiResponse.challengeWorkflowId,
    createdAt: new Date(apiResponse.createdAt),
    updatedAt: new Date(apiResponse.updatedAt),
    createdBy: apiResponse.createdBy,
    totalExecutions: apiResponse.totalExecutions || 0,
    completedExecutions: apiResponse.completedExecutions || 0,
    runningExecutions: apiResponse.runningExecutions || 0,
    failedExecutions: apiResponse.failedExecutions || 0,
    lastExecutionAt: apiResponse.lastExecutionAt ? new Date(apiResponse.lastExecutionAt) : undefined,
  };
}

// Map API execution to frontend
function mapApiExecutionToFrontend(apiResponse: ExecutionResponse): ChampionChallengeExecution {
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
    comparisonId: apiResponse.id, // Will be set properly by backend
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

// Generate mock comparisons
function generateMockComparisons(): ChampionChallengeComparison[] {
  return [
    {
      id: 'mock-comp-1',
      name: 'Payment Flow v1 vs v2',
      description: 'Testing new payment processing workflow',
      championWorkflowId: 'payment-v1',
      challengeWorkflowId: 'payment-v2',
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 3600000),
      totalExecutions: 3,
      completedExecutions: 2,
      runningExecutions: 1,
      failedExecutions: 0,
      lastExecutionAt: new Date(Date.now() - 3600000),
    },
    {
      id: 'mock-comp-2',
      name: 'Order Fulfillment Optimization',
      description: 'Comparing standard vs optimized order flow',
      championWorkflowId: 'order-v1',
      challengeWorkflowId: 'order-v2',
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 7200000),
      totalExecutions: 5,
      completedExecutions: 5,
      runningExecutions: 0,
      failedExecutions: 0,
      lastExecutionAt: new Date(Date.now() - 7200000),
    },
  ];
}

// Generate mock execution
function generateMockExecution(comparisonId: string, comparison: ChampionChallengeComparison): ChampionChallengeExecution {
  const id = `mock-exec-${Date.now()}`;
  const nodes = [
    { id: 'start', name: 'StartEvent', type: 'Event' },
    { id: 'validate', name: 'ServiceTask_ValidateInput', type: 'ServiceTask' },
    { id: 'process', name: 'ServiceTask_ProcessData', type: 'ServiceTask' },
    { id: 'call', name: 'ServiceTask_CallAPI', type: 'ServiceTask' },
    { id: 'end', name: 'EndEvent', type: 'Event' },
  ];

  const generateMetrics = (variant: 'champion' | 'challenge'): NodeMetric[] => {
    const baseMultiplier = variant === 'champion' ? 1 : 0.85;
    return nodes.map((node, index) => ({
      id: `${id}-${variant}-${index}`,
      executionId: id,
      variant,
      nodeId: node.id,
      nodeName: node.name,
      nodeType: node.type,
      requestData: { payload: 'test' },
      responseData: { result: 'success' },
      executionTimeMs: Math.floor((Math.random() * 200 + 100) * baseMultiplier),
      status: 'success' as const,
      startedAt: new Date(Date.now() - 5000),
      completedAt: new Date(),
      metadata: { memoryUsed: 20 + Math.random() * 80, cpuUsage: 10 + Math.random() * 80 },
    }));
  };

  return {
    id,
    comparisonId,
    name: comparison.name,
    description: comparison.description,
    championWorkflowId: comparison.championWorkflowId,
    challengeWorkflowId: comparison.challengeWorkflowId,
    requestPayload: { testData: 'example' },
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

export class ChampionChallengeService {
  private useBackend: boolean = true;
  private mockComparisons: ChampionChallengeComparison[] = generateMockComparisons();
  private mockExecutions: Map<string, ChampionChallengeExecution[]> = new Map();

  // ========== COMPARISON METHODS (MASTER) ==========

  async createComparison(
    name: string,
    description: string,
    championWorkflowId: string,
    challengeWorkflowId: string
  ): Promise<ChampionChallengeComparison> {
    if (this.useBackend) {
      try {
        const response = await championChallengeApiService.createComparison({
          name,
          description,
          championWorkflowId,
          challengeWorkflowId,
        });
        return mapApiComparisonToFrontend(response);
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }

    const mockComparison: ChampionChallengeComparison = {
      id: `mock-comp-${Date.now()}`,
      name,
      description,
      championWorkflowId,
      challengeWorkflowId,
      createdAt: new Date(),
      updatedAt: new Date(),
      totalExecutions: 0,
      completedExecutions: 0,
      runningExecutions: 0,
      failedExecutions: 0,
    };
    this.mockComparisons.unshift(mockComparison);
    return mockComparison;
  }

  async listComparisons(): Promise<ChampionChallengeComparison[]> {
    if (this.useBackend) {
      try {
        const responses = await championChallengeApiService.listComparisons();
        return responses.map(mapApiComparisonToFrontend);
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }

    return this.mockComparisons;
  }

  async getComparison(id: string): Promise<ChampionChallengeComparison | null> {
    if (this.useBackend) {
      try {
        const response = await championChallengeApiService.getComparison(id);
        return mapApiComparisonToFrontend(response);
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }

    return this.mockComparisons.find(c => c.id === id) || null;
  }

  async deleteComparison(id: string): Promise<void> {
    if (this.useBackend) {
      try {
        await championChallengeApiService.deleteComparison(id);
        return;
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }

    this.mockComparisons = this.mockComparisons.filter(c => c.id !== id);
  }

  // ========== EXECUTION METHODS (DETAIL) ==========

  async executeComparison(
    comparisonId: string,
    requestPayload: any
  ): Promise<ChampionChallengeExecution> {
    if (this.useBackend) {
      try {
        const response = await championChallengeApiService.executeComparison(comparisonId, requestPayload);
        return mapApiExecutionToFrontend(response);
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }

    const comparison = this.mockComparisons.find(c => c.id === comparisonId);
    if (!comparison) throw new Error('Comparison not found');

    const mockExecution = generateMockExecution(comparisonId, comparison);
    const executions = this.mockExecutions.get(comparisonId) || [];
    executions.unshift(mockExecution);
    this.mockExecutions.set(comparisonId, executions);

    comparison.totalExecutions++;
    comparison.completedExecutions++;
    comparison.lastExecutionAt = new Date();

    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockExecution;
  }

  async listExecutions(comparisonId: string): Promise<ChampionChallengeExecution[]> {
    if (this.useBackend) {
      try {
        const responses = await championChallengeApiService.listExecutions(comparisonId);
        return responses.map(mapApiExecutionToFrontend);
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }

    return this.mockExecutions.get(comparisonId) || [];
  }

  async getExecution(executionId: string): Promise<ChampionChallengeExecution | null> {
    if (this.useBackend) {
      try {
        const response = await championChallengeApiService.getExecution(executionId);
        return mapApiExecutionToFrontend(response);
      } catch (error) {
        console.warn('Backend API failed, using mock data:', error);
        this.useBackend = false;
      }
    }

    for (const executions of this.mockExecutions.values()) {
      const found = executions.find(e => e.id === executionId);
      if (found) return found;
    }
    return null;
  }

  resetToBackend() {
    this.useBackend = true;
  }
}

export const championChallengeService = new ChampionChallengeService();
