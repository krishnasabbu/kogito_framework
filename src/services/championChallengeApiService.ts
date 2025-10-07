import { supabase } from '../lib/supabaseClient';
import {
  ChampionChallengeExecution,
  NodeMetric,
  MetricComparison,
  ComparisonFilter,
} from '../types/championChallenge';

const EXECUTIONS_TABLE = 'champion_challenge_executions';
const METRICS_TABLE = 'execution_node_metrics';
const COMPARISONS_TABLE = 'execution_comparisons';

export class ChampionChallengeApiService {
  async createExecution(
    name: string,
    description: string,
    championWorkflowId: string,
    challengeWorkflowId: string,
    requestPayload: any
  ): Promise<ChampionChallengeExecution> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const execution = {
      name,
      description,
      champion_workflow_id: championWorkflowId,
      challenge_workflow_id: challengeWorkflowId,
      request_payload: requestPayload,
      status: 'PENDING',
      created_by: user.user.id,
    };

    const { data, error } = await supabase
      .from(EXECUTIONS_TABLE)
      .insert(execution)
      .select()
      .single();

    if (error) throw new Error(`Failed to create execution: ${error.message}`);

    const executionData = this.mapFromDatabase(data);

    this.executeAsync(executionData.id);

    return executionData;
  }

  private async executeAsync(executionId: string) {
    try {
      await this.updateExecutionStatus(executionId, 'RUNNING');

      const execution = await this.getExecution(executionId);

      const [championMetrics, challengeMetrics] = await Promise.all([
        this.executeWorkflow(
          executionId,
          execution.championWorkflowId,
          execution.requestPayload,
          'CHAMPION'
        ),
        this.executeWorkflow(
          executionId,
          execution.challengeWorkflowId,
          execution.requestPayload,
          'CHALLENGE'
        ),
      ]);

      await Promise.all([
        this.saveMetrics(executionId, championMetrics),
        this.saveMetrics(executionId, challengeMetrics),
      ]);

      await this.calculateComparisons(executionId, championMetrics, challengeMetrics);

      const championTime = championMetrics.reduce((sum, m) => sum + m.executionTimeMs, 0);
      const challengeTime = challengeMetrics.reduce((sum, m) => sum + m.executionTimeMs, 0);

      const winner =
        championTime < challengeTime
          ? 'CHAMPION'
          : challengeTime < championTime
          ? 'CHALLENGE'
          : 'TIE';

      await supabase
        .from(EXECUTIONS_TABLE)
        .update({
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
          total_champion_time_ms: championTime,
          total_challenge_time_ms: challengeTime,
          winner,
        })
        .eq('id', executionId);
    } catch (error) {
      console.error('Execution failed:', error);
      await this.updateExecutionStatus(executionId, 'FAILED');
    }
  }

  private async executeWorkflow(
    executionId: string,
    workflowId: string,
    payload: any,
    variant: 'CHAMPION' | 'CHALLENGE'
  ): Promise<NodeMetric[]> {
    const nodes = [
      { id: 'start', name: 'Start', type: 'startEvent' },
      { id: 'validate', name: 'Validate Input', type: 'serviceTask' },
      { id: 'process', name: 'Process Data', type: 'serviceTask' },
      { id: 'transform', name: 'Transform Result', type: 'serviceTask' },
      { id: 'end', name: 'End', type: 'endEvent' },
    ];

    const metrics: NodeMetric[] = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const startTime = Date.now();

      await this.simulateDelay();

      const endTime = Date.now();
      const executionTimeMs = endTime - startTime;

      const metric: NodeMetric = {
        id: `${executionId}-${variant}-${node.id}`,
        executionId,
        variant: variant.toLowerCase() as 'champion' | 'challenge',
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
        requestData: payload,
        responseData: { processed: true, timestamp: new Date().toISOString() },
        executionTimeMs,
        status: Math.random() > 0.05 ? 'success' : 'error',
        startedAt: new Date(startTime),
        completedAt: new Date(endTime),
        metadata: {
          memoryUsed: Math.random() * 100,
          cpuUsage: Math.random() * 100,
        },
      };

      metrics.push(metric);

      if (metric.status === 'error') {
        metric.errorMessage = `Simulated error in ${node.name}`;
        break;
      }
    }

    return metrics;
  }

  private async simulateDelay(): Promise<void> {
    const delay = Math.random() * 500 + 100;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  private async saveMetrics(executionId: string, metrics: NodeMetric[]): Promise<void> {
    const dbMetrics = metrics.map((m, index) => ({
      execution_id: executionId,
      variant: m.variant.toUpperCase(),
      node_id: m.nodeId,
      node_name: m.nodeName,
      node_type: m.nodeType,
      sequence: index,
      request_data: m.requestData,
      response_data: m.responseData,
      execution_time_ms: m.executionTimeMs,
      status: m.status.toUpperCase(),
      error_message: m.errorMessage,
      started_at: m.startedAt.toISOString(),
      completed_at: m.completedAt?.toISOString(),
      memory_used_mb: m.metadata?.memoryUsed,
      cpu_usage_percent: m.metadata?.cpuUsage,
      metadata: m.metadata,
    }));

    const { error } = await supabase.from(METRICS_TABLE).insert(dbMetrics);

    if (error) throw new Error(`Failed to save metrics: ${error.message}`);
  }

  private async calculateComparisons(
    executionId: string,
    championMetrics: NodeMetric[],
    challengeMetrics: NodeMetric[]
  ): Promise<void> {
    const comparisons = [];

    const championTotalTime = championMetrics.reduce((sum, m) => sum + m.executionTimeMs, 0);
    const challengeTotalTime = challengeMetrics.reduce((sum, m) => sum + m.executionTimeMs, 0);

    comparisons.push(
      this.createComparison(
        executionId,
        'Total Execution Time',
        'PERFORMANCE',
        championTotalTime,
        challengeTotalTime,
        'ms'
      )
    );

    const championAvgTime = championTotalTime / championMetrics.length || 0;
    const challengeAvgTime = challengeTotalTime / challengeMetrics.length || 0;

    comparisons.push(
      this.createComparison(
        executionId,
        'Average Node Time',
        'PERFORMANCE',
        championAvgTime,
        challengeAvgTime,
        'ms'
      )
    );

    const championSuccessRate =
      (championMetrics.filter((m) => m.status === 'success').length /
        championMetrics.length) *
      100;
    const challengeSuccessRate =
      (challengeMetrics.filter((m) => m.status === 'success').length /
        challengeMetrics.length) *
      100;

    comparisons.push(
      this.createComparison(
        executionId,
        'Success Rate',
        'QUALITY',
        championSuccessRate,
        challengeSuccessRate,
        '%'
      )
    );

    const { error } = await supabase.from(COMPARISONS_TABLE).insert(comparisons);

    if (error) throw new Error(`Failed to save comparisons: ${error.message}`);
  }

  private createComparison(
    executionId: string,
    metricName: string,
    category: string,
    championValue: number,
    challengeValue: number,
    unit: string
  ) {
    const difference = challengeValue - championValue;
    const differencePercentage = championValue === 0 ? 0 : (difference / championValue) * 100;

    let winner;
    if (category === 'QUALITY') {
      winner =
        championValue > challengeValue
          ? 'CHAMPION'
          : challengeValue > championValue
          ? 'CHALLENGE'
          : 'TIE';
    } else {
      winner =
        championValue < challengeValue
          ? 'CHAMPION'
          : challengeValue < championValue
          ? 'CHALLENGE'
          : 'TIE';
    }

    return {
      execution_id: executionId,
      metric_name: metricName,
      metric_category: category,
      champion_value: championValue,
      challenge_value: challengeValue,
      difference,
      difference_percentage: differencePercentage,
      winner,
      unit,
    };
  }

  async getExecution(executionId: string): Promise<ChampionChallengeExecution> {
    const { data, error } = await supabase
      .from(EXECUTIONS_TABLE)
      .select('*')
      .eq('id', executionId)
      .single();

    if (error) throw new Error(`Failed to fetch execution: ${error.message}`);

    const execution = this.mapFromDatabase(data);

    const metrics = await this.getMetrics(executionId);
    execution.metrics = {
      champion: metrics.filter((m) => m.variant === 'champion'),
      challenge: metrics.filter((m) => m.variant === 'challenge'),
    };

    return execution;
  }

  async listExecutions(): Promise<ChampionChallengeExecution[]> {
    const { data, error } = await supabase
      .from(EXECUTIONS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to list executions: ${error.message}`);

    const executions = await Promise.all(
      data.map(async (exec: any) => {
        const execution = this.mapFromDatabase(exec);
        const metrics = await this.getMetrics(execution.id);
        execution.metrics = {
          champion: metrics.filter((m) => m.variant === 'champion'),
          challenge: metrics.filter((m) => m.variant === 'challenge'),
        };
        return execution;
      })
    );

    return executions;
  }

  private async getMetrics(executionId: string): Promise<NodeMetric[]> {
    const { data, error } = await supabase
      .from(METRICS_TABLE)
      .select('*')
      .eq('execution_id', executionId)
      .order('sequence', { ascending: true });

    if (error) throw new Error(`Failed to fetch metrics: ${error.message}`);

    return data.map(this.mapMetricFromDatabase);
  }

  private async updateExecutionStatus(executionId: string, status: string): Promise<void> {
    const updates: any = { status };

    if (status === 'RUNNING') {
      updates.started_at = new Date().toISOString();
    }

    await supabase.from(EXECUTIONS_TABLE).update(updates).eq('id', executionId);
  }

  private mapFromDatabase(data: any): ChampionChallengeExecution {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      championWorkflowId: data.champion_workflow_id,
      challengeWorkflowId: data.challenge_workflow_id,
      requestPayload: data.request_payload,
      status: data.status.toLowerCase() as any,
      startedAt: data.started_at ? new Date(data.started_at) : new Date(),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      createdAt: new Date(data.created_at),
      metrics: { champion: [], challenge: [] },
    };
  }

  private mapMetricFromDatabase(data: any): NodeMetric {
    return {
      id: data.id,
      executionId: data.execution_id,
      variant: data.variant.toLowerCase() as any,
      nodeId: data.node_id,
      nodeName: data.node_name,
      nodeType: data.node_type,
      requestData: data.request_data,
      responseData: data.response_data,
      executionTimeMs: data.execution_time_ms,
      status: data.status.toLowerCase() as any,
      errorMessage: data.error_message,
      startedAt: new Date(data.started_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      metadata: {
        memoryUsed: data.memory_used_mb,
        cpuUsage: data.cpu_usage_percent,
        ...data.metadata,
      },
    };
  }
}

export const championChallengeApiService = new ChampionChallengeApiService();
