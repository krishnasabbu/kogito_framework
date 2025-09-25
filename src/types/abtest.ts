export interface ABTestConfig {
  id: string;
  name: string;
  description?: string;
  springProjectPath: string;
  arms: ABTestArm[];
  trafficSplit: number; // 0-100, percentage for first arm
  status: 'draft' | 'running' | 'stopped' | 'completed';
  generateListener: boolean;
  listenerConfig?: ListenerConfig;
  createdAt: string;
  updatedAt: string;
}

export interface ABTestArm {
  armKey: string; // 'a', 'b', etc.
  armName: string; // Dynamic name from BPMN file or custom label
  bpmnFile: string; // Relative path to BPMN file
  customLabel?: string; // User-provided override label
  processDefinitionKey?: string; // Extracted from BPMN
}

export interface ListenerConfig {
  packageName: string;
  className: string;
  filePath: string;
  generated: boolean;
}

export interface BpmnFile {
  path: string;
  filename: string;
  friendlyName: string;
  content?: string;
  processDefinitionKey?: string;
}

export interface ProjectScanResult {
  projectPath: string;
  bpmnFiles: BpmnFile[];
  resourcesPath: string;
  processesPath?: string;
}

export interface ABTestMetrics {
  testId: string;
  totalRuns: number;
  armStats: Record<string, ArmStatistics>;
  timeSeriesData: TimeSeriesPoint[];
  serviceExecutions: ServiceExecution[];
  latencyPercentiles: LatencyPercentiles;
  throughputMetrics: ThroughputMetrics;
  slaMetrics: SLAMetrics;
  concurrencyMetrics: ConcurrencyMetrics;
  errorBreakdown: ErrorBreakdown[];
  activityPerformance: ActivityPerformance[];
}

export interface ArmStatistics {
  armKey: string;
  armName: string;
  runs: number;
  successRate: number;
  errorRate: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  totalDuration: number;
  retryCount: number;
  queueTime: number;
}

export interface LatencyPercentiles {
  p50: Record<string, number>;
  p90: Record<string, number>;
  p95: Record<string, number>;
  p99: Record<string, number>;
}

export interface ThroughputMetrics {
  rps: Record<string, number>;
  peakRps: Record<string, number>;
  avgRps: Record<string, number>;
  totalRequests: Record<string, number>;
}

export interface SLAMetrics {
  slaThreshold: number;
  breaches: Record<string, number>;
  complianceRate: Record<string, number>;
  avgResponseTime: Record<string, number>;
}

export interface ConcurrencyMetrics {
  maxConcurrent: Record<string, number>;
  avgConcurrent: Record<string, number>;
  queueTime: Record<string, number>;
  waitTime: Record<string, number>;
}

export interface ErrorBreakdown {
  errorType: string;
  count: Record<string, number>;
  percentage: Record<string, number>;
}

export interface ActivityPerformance {
  activityId: string;
  activityName: string;
  avgDuration: Record<string, number>;
  errorRate: Record<string, number>;
  executionCount: Record<string, number>;
}

export interface TimeSeriesPoint {
  timestamp: string;
  armData: Record<string, {
    requests: number;
    success: number;
    errors: number;
    avgDuration: number;
  }>;
}

export interface ServiceExecution {
  serviceName: string;
  armCounts: Record<string, number>;
}

export interface ExecutionLog {
  id: string;
  testId: string;
  armKey: string;
  armName: string;
  status: 'success' | 'error';
  duration: number;
  timestamp: string;
  errorMessage?: string;
  errorType?: string;
  serviceName?: string;
  serviceSteps: ServiceStep[];
  retryCount: number;
  queueTime: number;
  processInstanceId?: string;
  activityExecutions: ActivityExecution[];
}

export interface ServiceStep {
  id: string;
  serviceName: string;
  method: string;
  url: string;
  status: 'success' | 'error';
  duration: number;
  request: any;
  response: any;
  timestamp: string;
  retryCount: number;
  errorType?: string;
}

export interface ActivityExecution {
  activityId: string;
  activityName: string;
  status: 'success' | 'error' | 'skipped';
  startTime: string;
  endTime: string;
  duration: number;
  inputData?: any;
  outputData?: any;
  errorMessage?: string;
}

export interface TimeFilter {
  label: string;
  value: string;
  minutes: number;
}

// Database Entities (for Hibernate)
export interface ABTestEntity {
  id: string;
  name: string;
  description?: string;
  springProjectPath: string;
  trafficSplit: number;
  status: string;
  generateListener: boolean;
  listenerPackageName?: string;
  listenerClassName?: string;
  listenerFilePath?: string;
  listenerGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
  arms: ABTestArmEntity[];
  executions: ExecutionLogEntity[];
}

export interface ABTestArmEntity {
  id: string;
  testId: string;
  armKey: string;
  armName: string;
  bpmnFile: string;
  customLabel?: string;
  processDefinitionKey?: string;
  createdAt: Date;
}

export interface ExecutionLogEntity {
  id: string;
  testId: string;
  armKey: string;
  armName: string;
  status: string;
  duration: number;
  timestamp: Date;
  errorMessage?: string;
  errorType?: string;
  serviceName?: string;
  retryCount: number;
  queueTime: number;
  processInstanceId?: string;
  requestPayload?: string;
  responsePayload?: string;
  serviceSteps: ServiceStepEntity[];
  activityExecutions: ActivityExecutionEntity[];
}

export interface ServiceStepEntity {
  id: string;
  executionLogId: string;
  serviceName: string;
  method: string;
  url: string;
  status: string;
  duration: number;
  timestamp: Date;
  retryCount: number;
  errorType?: string;
  requestPayload?: string;
  responsePayload?: string;
}

export interface ActivityExecutionEntity {
  id: string;
  executionLogId: string;
  activityId: string;
  activityName: string;
  status: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  inputData?: string;
  outputData?: string;
  errorMessage?: string;
}

// API Contracts
export interface CreateABTestRequest {
  name: string;
  description?: string;
  springProjectPath: string;
  arms: {
    armKey: string;
    bpmnFile: string;
    customLabel?: string;
  }[];
  trafficSplit: number;
  generateListener: boolean;
}

export interface CreateABTestResponse {
  success: boolean;
  testId: string;
  message: string;
  listenerGenerated?: boolean;
  listenerPath?: string;
  errors?: string[];
}

export interface GetMetricsResponse {
  testId: string;
  metrics: ABTestMetrics;
  lastUpdated: string;
}

export interface GetLogsResponse {
  testId: string;
  logs: ExecutionLog[];
  totalCount: number;
  page: number;
  pageSize: number;
}