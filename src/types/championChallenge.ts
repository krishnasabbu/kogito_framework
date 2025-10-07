export interface NodeMetric {
  id: string;
  executionId: string;
  variant: 'champion' | 'challenge';
  nodeId: string;
  nodeName: string;
  nodeType: string;
  requestData: any;
  responseData: any;
  executionTimeMs: number;
  status: 'success' | 'error' | 'skipped';
  errorMessage?: string;
  startedAt: Date;
  completedAt?: Date;
  metadata?: {
    memoryUsed?: number;
    cpuUsage?: number;
    [key: string]: any;
  };
}

export interface ChampionChallengeExecution {
  id: string;
  name: string;
  description?: string;
  championWorkflowId: string;
  challengeWorkflowId: string;
  requestPayload: any;
  status: 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  metrics: {
    champion: NodeMetric[];
    challenge: NodeMetric[];
  };
}

export interface MetricComparison {
  id: string;
  executionId: string;
  metricName: string;
  championValue: number;
  challengeValue: number;
  differencePercentage: number;
  winner: 'champion' | 'challenge' | 'tie';
}

export interface ComparisonSummary {
  totalExecutionTime: MetricComparison;
  averageNodeTime: MetricComparison;
  successRate: MetricComparison;
  errorCount: MetricComparison;
  totalNodes: MetricComparison;
}

export interface JsonFilter {
  id: string;
  path: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'exists' | 'notExists';
  value?: any;
  enabled: boolean;
}

export interface ComparisonFilter {
  variant?: 'champion' | 'challenge' | 'both';
  status?: 'success' | 'error' | 'skipped' | 'all';
  nodeTypes?: string[];
  executionTimeRange?: {
    min: number;
    max: number;
  };
  jsonFilters: JsonFilter[];
}
