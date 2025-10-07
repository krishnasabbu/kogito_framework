// Master: Comparison definition
export interface ChampionChallengeComparison {
  id: string;
  name: string;
  description?: string;
  championWorkflowId: string;
  challengeWorkflowId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  totalExecutions: number;
  completedExecutions: number;
  runningExecutions: number;
  failedExecutions: number;
  lastExecutionAt?: Date;
}

// Detail: Individual execution under a comparison
export interface ChampionChallengeExecution {
  id: string;
  comparisonId: string;  // Reference to comparison
  name: string;  // From comparison
  description?: string;  // From comparison
  championWorkflowId: string;  // From comparison
  challengeWorkflowId: string;  // From comparison
  requestPayload: any;  // Execution-specific
  status: 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  metrics: {
    champion: NodeMetric[];
    challenge: NodeMetric[];
  };
}

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
