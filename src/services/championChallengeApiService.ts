const BACKEND_BASE_URL = 'http://localhost:8989';

interface ExecutionRequest {
  name: string;
  description?: string;
  championWorkflowId: string;
  challengeWorkflowId: string;
  requestPayload?: string;
}

interface ExecutionResponse {
  id: string;
  name: string;
  description: string;
  championWorkflowId: string;
  challengeWorkflowId: string;
  requestPayload: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  createdBy: string;
  totalChampionTimeMs: number;
  totalChallengeTimeMs: number;
  winner: string;
  championMetrics: NodeMetricResponse[];
  challengeMetrics: NodeMetricResponse[];
}

interface NodeMetricResponse {
  id: string;
  variant: string;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  requestData: string;
  responseData: string;
  executionTimeMs: number;
  status: string;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string;
  metadata: string;
}

interface AnalyticsResponse {
  summaryCards: SummaryCards;
  executionTimeData: ExecutionTimeData[];
  pieData: PieData[];
  successRateData: SuccessRateData[];
  cumulativeData: CumulativeData[];
  radarData: RadarData;
  performanceComparison: PerformanceComparison[];
  detailedStatistics: DetailedStatistics;
}

interface SummaryCards {
  championTime: number;
  challengeTime: number;
  winner: string;
  improvement: number;
}

interface ExecutionTimeData {
  node: string;
  champion: number;
  challenge: number;
}

interface PieData {
  name: string;
  value: number;
}

interface SuccessRateData {
  variant: string;
  success: number;
  error: number;
}

interface CumulativeData {
  node: string;
  championCumulative: number;
  challengeCumulative: number;
}

interface RadarData {
  metrics: string[];
  champion: number[];
  challenge: number[];
}

interface PerformanceComparison {
  metric: string;
  championValue: number;
  challengeValue: number;
}

interface DetailedStatistics {
  totalChampionNodes: number;
  totalChallengeNodes: number;
  championSuccess: number;
  challengeSuccess: number;
  championSuccessRate: number;
  challengeSuccessRate: number;
}

export class ChampionChallengeApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${BACKEND_BASE_URL}/api/v2/champion-challenge/executions`;
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

  async createExecution(
    name: string,
    description: string,
    championWorkflowId: string,
    challengeWorkflowId: string,
    requestPayload: any = {}
  ): Promise<ExecutionResponse> {
    const request: ExecutionRequest = {
      name,
      description,
      championWorkflowId,
      challengeWorkflowId,
      requestPayload: JSON.stringify(requestPayload),
    };

    return this.apiCall<ExecutionResponse>('', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getExecution(executionId: string): Promise<ExecutionResponse> {
    return this.apiCall<ExecutionResponse>(`/${executionId}`, {
      method: 'GET',
    });
  }

  async listExecutions(): Promise<ExecutionResponse[]> {
    return this.apiCall<ExecutionResponse[]>('', {
      method: 'GET',
    });
  }

  async getAnalytics(executionId: string): Promise<AnalyticsResponse> {
    return this.apiCall<AnalyticsResponse>(`/${executionId}/analytics`, {
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

export const championChallengeApiService = new ChampionChallengeApiService();
export type {
  ExecutionRequest,
  ExecutionResponse,
  NodeMetricResponse,
  AnalyticsResponse,
  SummaryCards,
  ExecutionTimeData,
  PieData,
  SuccessRateData,
  CumulativeData,
  RadarData,
  PerformanceComparison,
  DetailedStatistics,
};
