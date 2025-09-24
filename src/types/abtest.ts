export interface ABTestConfig {
  id: string;
  name: string;
  optionA: {
    name: string;
    bpmnFile: string;
  };
  optionB: {
    name: string;
    bpmnFile: string;
  };
  trafficSplit: number; // 0-100, percentage for Option A
  status: 'draft' | 'running' | 'stopped' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface ABTestMetrics {
  testId: string;
  totalRuns: number;
  optionAStats: {
    runs: number;
    successRate: number;
    errorRate: number;
    avgDuration: number;
  };
  optionBStats: {
    runs: number;
    successRate: number;
    errorRate: number;
    avgDuration: number;
  };
  timeSeriesData: TimeSeriesPoint[];
  serviceExecutions: ServiceExecution[];
}

export interface TimeSeriesPoint {
  timestamp: string;
  optionARequests: number;
  optionBRequests: number;
  optionASuccess: number;
  optionBSuccess: number;
}

export interface ServiceExecution {
  serviceName: string;
  optionACount: number;
  optionBCount: number;
}

export interface ExecutionLog {
  id: string;
  testId: string;
  option: 'A' | 'B';
  status: 'success' | 'error';
  duration: number;
  timestamp: string;
  errorMessage?: string;
  serviceName?: string;
}

export interface TimeFilter {
  label: string;
  value: string;
  minutes: number;
}