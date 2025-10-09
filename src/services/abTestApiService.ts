const BACKEND_BASE_URL = 'http://localhost:8989';

interface ABTestResponse {
  id: string;
  name: string;
  description: string;
  workflowId: string;
  trafficSplit: number;
  status: string;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  createdBy: string;
  hypothesis: string;
  successMetric: string;
  minimumSampleSize: number;
  confidenceLevel: number;
  arms: TestArmResponse[];
  summary?: TestSummary;
}

interface TestArmResponse {
  id: string;
  name: string;
  description: string;
  bpmnFilePath: string;
  trafficPercentage: number;
  isControl: boolean;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  avgExecutionTimeMs: number;
  minExecutionTimeMs: number;
  maxExecutionTimeMs: number;
  totalExecutionTimeMs: number;
  successRate: number;
  errorRate: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
}

interface TestSummary {
  totalExecutions: number;
  winningArm: string;
  confidenceScore: number;
  isStatisticallySignificant: boolean;
  recommendation: string;
}

interface CreateABTestRequest {
  name: string;
  description: string;
  workflowId: string;
  trafficSplit: number;
  hypothesis: string;
  successMetric: string;
  minimumSampleSize: number;
  confidenceLevel: number;
  arms: {
    name: string;
    description: string;
    bpmnFilePath: string;
    trafficPercentage: number;
    isControl: boolean;
  }[];
}

interface ExecuteABTestRequest {
  requestPayload: string;
  userId?: string;
  sessionId?: string;
  metadata?: string;
}

interface ExecutionResultResponse {
  testId: string;
  selectedArmId: string;
  status: string;
  executionTimeMs: number;
}

interface ABTestAnalyticsResponse {
  overview: OverviewMetrics;
  armPerformance: ArmPerformance[];
  timeSeries: TimeSeriesData[];
  statisticalAnalysis: StatisticalAnalysis;
}

interface OverviewMetrics {
  totalExecutions: number;
  totalSuccessful: number;
  totalFailed: number;
  overallSuccessRate: number;
  avgExecutionTime: number;
  currentWinner: string;
  winnerConfidence: number;
  isStatisticallySignificant: boolean;
  sampleSizeReached: number;
  sampleSizeTarget: number;
}

interface ArmPerformance {
  armId: string;
  armName: string;
  isControl: boolean;
  executions: number;
  successRate: number;
  errorRate: number;
  avgExecutionTime: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
  improvementVsControl: number;
  status: string;
}

interface TimeSeriesData {
  timestamp: string;
  executionsByArm: Record<string, number>;
  successRateByArm: Record<string, number>;
  avgLatencyByArm: Record<string, number>;
}

interface StatisticalAnalysis {
  testType: string;
  pValue: number;
  confidenceLevel: number;
  isSignificant: boolean;
  effectSize: number;
  degreesOfFreedom: number;
  interpretation: string;
  recommendation: string;
  minimumDetectableEffect: number;
  requiredSampleSize: number;
}

class ABTestApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${BACKEND_BASE_URL}/api/v1/ab-tests`;
  }

  private async apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async createABTest(request: CreateABTestRequest): Promise<ABTestResponse> {
    return this.apiCall<ABTestResponse>('', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getAllABTests(): Promise<ABTestResponse[]> {
    return this.apiCall<ABTestResponse[]>('', { method: 'GET' });
  }

  async getABTest(testId: string): Promise<ABTestResponse> {
    return this.apiCall<ABTestResponse>(`/${testId}`, { method: 'GET' });
  }

  async startABTest(testId: string): Promise<ABTestResponse> {
    return this.apiCall<ABTestResponse>(`/${testId}/start`, { method: 'POST' });
  }

  async stopABTest(testId: string): Promise<ABTestResponse> {
    return this.apiCall<ABTestResponse>(`/${testId}/stop`, { method: 'POST' });
  }

  async executeABTest(
    testId: string,
    request: ExecuteABTestRequest
  ): Promise<ExecutionResultResponse> {
    return this.apiCall<ExecutionResultResponse>(`/${testId}/execute`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getAnalytics(testId: string): Promise<ABTestAnalyticsResponse> {
    return this.apiCall<ABTestAnalyticsResponse>(`/${testId}/analytics`, {
      method: 'GET',
    });
  }

  async getExecutionLogs(testId: string, page: number = 0, size: number = 100): Promise<ExecutionResultResponse[]> {
    return this.apiCall<ExecutionResultResponse[]>(`/${testId}/logs?page=${page}&size=${size}`, {
      method: 'GET',
    });
  }

  async getComprehensiveMetrics(testId: string): Promise<ABTestAnalyticsResponse> {
    return this.apiCall<ABTestAnalyticsResponse>(`/${testId}/comprehensive-metrics`, {
      method: 'GET',
    });
  }

  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/actuator/health`);
      return await response.json();
    } catch (error) {
      return { status: 'DOWN' };
    }
  }
}

export const abTestApiService = new ABTestApiService();
export { ABTestApiService };
export type {
  ABTestResponse,
  CreateABTestRequest,
  ExecuteABTestRequest,
  ExecutionResultResponse,
  ABTestAnalyticsResponse,
  OverviewMetrics,
  ArmPerformance,
  TestArmResponse,
};
