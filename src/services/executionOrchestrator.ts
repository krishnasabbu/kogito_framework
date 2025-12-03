import { ChampionChallengeExecution, NodeMetric } from '../types/championChallenge';
import { FlowSelector, ExecutionResponse, NodeExecutionResult } from '../types/langgraph';
import { langGraphApiService } from './langGraphApiService';
import { championChallengeService } from './championChallengeService';

export interface NormalizedExecutionResult {
  executionId: string;
  workflowId: string;
  totalTimeMs: number;
  status: 'success' | 'failed';
  nodeMetrics: NodeMetric[];
  output: any;
  metadata?: Record<string, any>;
}

export interface ComparisonExecutionRequest {
  name: string;
  description: string;
  championFlow: FlowSelector;
  challengeFlow: FlowSelector;
  requestPayload: any;
}

export interface ComparisonExecutionResult {
  execution: ChampionChallengeExecution;
  championResult: NormalizedExecutionResult;
  challengeResult: NormalizedExecutionResult;
}

class ExecutionOrchestrator {
  async executeComparison(
    request: ComparisonExecutionRequest
  ): Promise<ComparisonExecutionResult> {
    console.log('Starting comparison execution:', {
      champion: request.championFlow.mode,
      challenge: request.challengeFlow.mode
    });

    const [championResult, challengeResult] = await Promise.all([
      this.executeSingleFlow(request.championFlow, request.requestPayload, 'champion'),
      this.executeSingleFlow(request.challengeFlow, request.requestPayload, 'challenge')
    ]);

    const execution = await this.saveExecution(
      request.name,
      request.description,
      request.championFlow,
      request.challengeFlow,
      request.requestPayload,
      championResult,
      challengeResult
    );

    return {
      execution,
      championResult,
      challengeResult
    };
  }

  private async executeSingleFlow(
    flow: FlowSelector,
    input: any,
    variant: 'champion' | 'challenge'
  ): Promise<NormalizedExecutionResult> {
    console.log(`Executing ${variant} flow (mode: ${flow.mode})`);

    switch (flow.mode) {
      case 'langgraph':
        return this.executeLangGraphFlow(flow, input, variant);

      case 'bpmn':
        return this.executeBPMNFlow(flow, input, variant);

      case 'hybrid':
        return this.executeHybridFlow(flow, input, variant);

      default:
        throw new Error(`Unknown execution mode: ${flow.mode}`);
    }
  }

  private async executeLangGraphFlow(
    flow: FlowSelector,
    input: any,
    variant: 'champion' | 'challenge'
  ): Promise<NormalizedExecutionResult> {
    if (!flow.langgraph_flow_id) {
      throw new Error('LangGraph flow ID required for langgraph mode');
    }

    const startTime = Date.now();

    const executionResponse = await langGraphApiService.executeFlow({
      flow_id: flow.langgraph_flow_id,
      version: flow.langgraph_version,
      input: input,
      config: {
        streaming: false,
        checkpoint: true,
        metadata: {
          variant,
          client: 'workflow-orchestrator'
        }
      }
    });

    if (executionResponse.status === 'running') {
      const completedExecution = await langGraphApiService.waitForCompletion(
        executionResponse.execution_id
      );
      return this.normalizeLangGraphResult(completedExecution, variant);
    }

    return this.normalizeLangGraphResult(executionResponse, variant);
  }

  private normalizeLangGraphResult(
    response: ExecutionResponse,
    variant: 'champion' | 'challenge'
  ): NormalizedExecutionResult {
    const nodeMetrics: NodeMetric[] = response.node_results.map((nodeResult: NodeExecutionResult) => ({
      id: `${response.execution_id}-${nodeResult.node_id}`,
      executionId: response.execution_id,
      nodeId: nodeResult.node_id,
      nodeName: nodeResult.node_name,
      nodeType: nodeResult.node_type,
      variant: variant,
      status: nodeResult.status === 'success' ? 'success' : 'error',
      executionTimeMs: nodeResult.execution_time_ms,
      requestData: nodeResult.input,
      responseData: nodeResult.output,
      errorMessage: nodeResult.error?.message,
      timestamp: new Date(nodeResult.started_at)
    }));

    return {
      executionId: response.execution_id,
      workflowId: response.flow_id,
      totalTimeMs: response.metrics.total_time_ms,
      status: response.status === 'completed' ? 'success' : 'failed',
      nodeMetrics,
      output: response.output,
      metadata: {
        execution_mode: 'langgraph',
        flow_version: response.flow_version,
        node_count: response.metrics.node_count,
        retry_count: response.metrics.retry_count
      }
    };
  }

  private async executeBPMNFlow(
    flow: FlowSelector,
    input: any,
    variant: 'champion' | 'challenge'
  ): Promise<NormalizedExecutionResult> {
    console.log(`Executing BPMN flow for ${variant} (legacy mode)`);

    throw new Error('BPMN execution not yet implemented in orchestrator. Use existing championChallengeService.');
  }

  private async executeHybridFlow(
    flow: FlowSelector,
    input: any,
    variant: 'champion' | 'challenge'
  ): Promise<NormalizedExecutionResult> {
    console.log(`Executing hybrid flow for ${variant} - running both BPMN and LangGraph`);

    if (!flow.langgraph_flow_id) {
      console.warn('No LangGraph flow ID for hybrid mode, falling back to BPMN');
      return this.executeBPMNFlow(flow, input, variant);
    }

    try {
      const [bpmnResult, langGraphResult] = await Promise.allSettled([
        this.executeBPMNFlow(flow, input, variant),
        this.executeLangGraphFlow(flow, input, variant)
      ]);

      if (bpmnResult.status === 'fulfilled' && langGraphResult.status === 'fulfilled') {
        this.compareResults(bpmnResult.value, langGraphResult.value, variant);
        return langGraphResult.value;
      }

      if (langGraphResult.status === 'fulfilled') {
        console.warn('BPMN execution failed, using LangGraph result');
        return langGraphResult.value;
      }

      if (bpmnResult.status === 'fulfilled') {
        console.warn('LangGraph execution failed, using BPMN result');
        return bpmnResult.value;
      }

      throw new Error('Both BPMN and LangGraph executions failed');
    } catch (error) {
      console.error('Hybrid execution error:', error);
      throw error;
    }
  }

  private compareResults(
    bpmnResult: NormalizedExecutionResult,
    langGraphResult: NormalizedExecutionResult,
    variant: string
  ): void {
    const timeDiff = Math.abs(bpmnResult.totalTimeMs - langGraphResult.totalTimeMs);
    const timePercentDiff = (timeDiff / bpmnResult.totalTimeMs) * 100;

    const nodeDiff = Math.abs(bpmnResult.nodeMetrics.length - langGraphResult.nodeMetrics.length);

    console.log(`Hybrid Execution Comparison (${variant}):`, {
      timeDiffMs: timeDiff,
      timePercentDiff: timePercentDiff.toFixed(2) + '%',
      bpmnNodes: bpmnResult.nodeMetrics.length,
      langGraphNodes: langGraphResult.nodeMetrics.length,
      nodeDiff,
      bpmnStatus: bpmnResult.status,
      langGraphStatus: langGraphResult.status
    });

    if (timePercentDiff > 20) {
      console.warn(`Significant time difference detected: ${timePercentDiff.toFixed(2)}%`);
    }

    if (nodeDiff > 0) {
      console.warn(`Node count mismatch: BPMN=${bpmnResult.nodeMetrics.length}, LangGraph=${langGraphResult.nodeMetrics.length}`);
    }
  }

  private async saveExecution(
    name: string,
    description: string,
    championFlow: FlowSelector,
    challengeFlow: FlowSelector,
    requestPayload: any,
    championResult: NormalizedExecutionResult,
    challengeResult: NormalizedExecutionResult
  ): Promise<ChampionChallengeExecution> {
    const execution: ChampionChallengeExecution = {
      id: championResult.executionId || `exec-${Date.now()}`,
      name,
      description,
      status: 'completed',
      championWorkflowId: championFlow.langgraph_flow_id || championFlow.bpmn_workflow_id || 'unknown',
      challengeWorkflowId: challengeFlow.langgraph_flow_id || challengeFlow.bpmn_workflow_id || 'unknown',
      requestPayload,
      metrics: {
        champion: championResult.nodeMetrics,
        challenge: challengeResult.nodeMetrics
      },
      createdAt: new Date(),
      startedAt: new Date(),
      completedAt: new Date()
    };

    return execution;
  }

  async executeSingle(
    flowId: string,
    input: any,
    mode: 'langgraph' | 'bpmn' = 'langgraph'
  ): Promise<NormalizedExecutionResult> {
    const flow: FlowSelector = {
      mode,
      langgraph_flow_id: mode === 'langgraph' ? flowId : undefined,
      bpmn_workflow_id: mode === 'bpmn' ? flowId : undefined
    };

    return this.executeSingleFlow(flow, input, 'champion');
  }

  async streamComparison(
    request: ComparisonExecutionRequest,
    onChampionEvent: (event: any) => void,
    onChallengeEvent: (event: any) => void
  ): Promise<void> {
    if (request.championFlow.mode !== 'langgraph' || request.challengeFlow.mode !== 'langgraph') {
      throw new Error('Streaming only supported for LangGraph flows');
    }

    await Promise.all([
      langGraphApiService.streamExecution(
        {
          flow_id: request.championFlow.langgraph_flow_id!,
          input: request.requestPayload,
          config: { streaming: true }
        },
        onChampionEvent
      ),
      langGraphApiService.streamExecution(
        {
          flow_id: request.challengeFlow.langgraph_flow_id!,
          input: request.requestPayload,
          config: { streaming: true }
        },
        onChallengeEvent
      )
    ]);
  }
}

export const executionOrchestrator = new ExecutionOrchestrator();
export { ExecutionOrchestrator };
