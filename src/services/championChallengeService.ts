import { v4 as uuidv4 } from 'uuid';
import {
  ChampionChallengeExecution,
  NodeMetric,
} from '../types/championChallenge';

export class ChampionChallengeService {
  async executeComparison(
    championWorkflowId: string,
    challengeWorkflowId: string,
    requestPayload: any,
    name: string,
    description?: string
  ): Promise<ChampionChallengeExecution> {
    const execution: ChampionChallengeExecution = {
      id: uuidv4(),
      name,
      description,
      championWorkflowId,
      challengeWorkflowId,
      requestPayload,
      status: 'running',
      startedAt: new Date(),
      createdAt: new Date(),
      metrics: {
        champion: [],
        challenge: [],
      },
    };

    try {
      const [championResult, challengeResult] = await Promise.all([
        this.executeWorkflow(championWorkflowId, requestPayload, 'champion', execution.id),
        this.executeWorkflow(challengeWorkflowId, requestPayload, 'challenge', execution.id),
      ]);

      execution.metrics.champion = championResult;
      execution.metrics.challenge = challengeResult;
      execution.status = 'completed';
      execution.completedAt = new Date();
    } catch (error) {
      execution.status = 'failed';
      execution.completedAt = new Date();
      console.error('Execution failed:', error);
    }

    return execution;
  }

  private async executeWorkflow(
    workflowId: string,
    payload: any,
    variant: 'champion' | 'challenge',
    executionId: string
  ): Promise<NodeMetric[]> {
    const metrics: NodeMetric[] = [];

    const nodes = await this.parseWorkflowNodes(workflowId);

    for (const node of nodes) {
      const metric = await this.executeNode(node, payload, variant, executionId);
      metrics.push(metric);

      if (metric.status === 'error') {
        break;
      }

      payload = metric.responseData || payload;
    }

    return metrics;
  }

  private async parseWorkflowNodes(workflowId: string): Promise<any[]> {
    return [
      { id: 'start', name: 'Start', type: 'startEvent' },
      { id: 'validate', name: 'Validate Input', type: 'serviceTask' },
      { id: 'process', name: 'Process Data', type: 'serviceTask' },
      { id: 'transform', name: 'Transform Result', type: 'serviceTask' },
      { id: 'end', name: 'End', type: 'endEvent' },
    ];
  }

  private async executeNode(
    node: any,
    payload: any,
    variant: 'champion' | 'challenge',
    executionId: string
  ): Promise<NodeMetric> {
    const startTime = Date.now();
    const metric: NodeMetric = {
      id: uuidv4(),
      executionId,
      variant,
      nodeId: node.id,
      nodeName: node.name,
      nodeType: node.type,
      requestData: payload,
      responseData: null,
      executionTimeMs: 0,
      status: 'success',
      startedAt: new Date(),
      metadata: {},
    };

    try {
      await this.simulateProcessing();

      if (node.type === 'serviceTask') {
        const response = await this.callService(node, payload);
        metric.responseData = response;
        metric.metadata = {
          memoryUsed: Math.random() * 100,
          cpuUsage: Math.random() * 100,
        };
      } else {
        metric.responseData = payload;
      }

      if (Math.random() < 0.05) {
        throw new Error(`Simulated error in ${node.name}`);
      }

      metric.status = 'success';
    } catch (error: any) {
      metric.status = 'error';
      metric.errorMessage = error.message;
      metric.responseData = { error: error.message };
    }

    const endTime = Date.now();
    metric.executionTimeMs = endTime - startTime;
    metric.completedAt = new Date();

    return metric;
  }

  private async callService(node: any, payload: any): Promise<any> {
    await this.simulateProcessing();

    return {
      ...payload,
      [node.id]: {
        processed: true,
        timestamp: new Date().toISOString(),
        result: `Processed by ${node.name}`,
      },
    };
  }

  private async simulateProcessing(): Promise<void> {
    const delay = Math.random() * 500 + 100;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  async loadExecution(executionId: string): Promise<ChampionChallengeExecution | null> {
    return null;
  }

  async listExecutions(): Promise<ChampionChallengeExecution[]> {
    return [];
  }
}

export const championChallengeService = new ChampionChallengeService();
