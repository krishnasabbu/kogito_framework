export interface ApiABTest {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: ApiVariant[];
  trafficSplit: number;
  requestPayload?: any;
  headers?: Record<string, string>;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  successCriteria: SuccessCriteria;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ApiVariant {
  id: string;
  name: string;
  description?: string;
  apiEndpoint: string;
  headers?: Record<string, string>;
  trafficPercentage: number;
  isControl: boolean;
}

export interface SuccessCriteria {
  primaryMetric: 'latency' | 'success_rate' | 'error_rate' | 'throughput';
  minimumSampleSize: number;
  confidenceLevel: number;
  minimumDetectableEffect: number;
  maxDurationDays: number;
}

export interface ApiABTestExecution {
  id: string;
  testId: string;
  variantId: string;
  variantName: string;
  status: 'success' | 'error';
  latencyMs: number;
  statusCode: number;
  requestPayload: any;
  responsePayload: any;
  errorMessage?: string;
  timestamp: Date;
}

export interface ApiABTestMetrics {
  testId: string;
  totalExecutions: number;
  variantStats: Record<string, ApiVariantStats>;
  timeSeriesData: ApiTimeSeriesPoint[];
  latencyPercentiles: Record<string, LatencyPercentiles>;
  statusCodeDistribution: Record<string, StatusCodeCount[]>;
}

export interface ApiVariantStats {
  variantId: string;
  variantName: string;
  executions: number;
  successRate: number;
  errorRate: number;
  avgLatency: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
  minLatency: number;
  maxLatency: number;
  throughput: number;
  statusCodes: Record<number, number>;
}

export interface LatencyPercentiles {
  p50: number;
  p90: number;
  p95: number;
  p99: number;
}

export interface StatusCodeCount {
  code: number;
  count: number;
  percentage: number;
}

export interface ApiTimeSeriesPoint {
  timestamp: string;
  variantData: Record<string, {
    requests: number;
    avgLatency: number;
    successRate: number;
    errors: number;
  }>;
}

export interface CreateApiABTestRequest {
  name: string;
  description?: string;
  variants: {
    name: string;
    description?: string;
    apiEndpoint: string;
    headers?: Record<string, string>;
    trafficPercentage: number;
    isControl: boolean;
  }[];
  trafficSplit: number;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  requestPayload?: any;
  headers?: Record<string, string>;
  successCriteria: SuccessCriteria;
}

export interface ExecuteApiABTestRequest {
  testId: string;
  requestPayload?: any;
  overrideHeaders?: Record<string, string>;
}

export interface ApiABTestAnalytics {
  overview: {
    totalExecutions: number;
    avgLatency: number;
    successRate: number;
    errorRate: number;
    startDate: string;
    endDate: string;
  };
  variants: ApiVariantStats[];
  timeSeries: ApiTimeSeriesPoint[];
  winner?: {
    variantId: string;
    variantName: string;
    improvement: number;
    confidenceLevel: number;
  };
}
