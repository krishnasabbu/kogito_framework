import {
  LangGraphFlow,
  ExecutionRequest,
  ExecutionResponse,
  FlowVersion,
  StreamEvent,
  ErrorDetails
} from '../types/langgraph';

const LANGGRAPH_API_BASE_URL = import.meta.env.VITE_LANGGRAPH_API_URL || 'http://localhost:8000';
const LANGGRAPH_API_KEY = import.meta.env.VITE_LANGGRAPH_API_KEY || '';

interface ApiResponse<T> {
  data?: T;
  error?: ErrorDetails;
}

class LangGraphApiService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = LANGGRAPH_API_BASE_URL;
    this.apiKey = LANGGRAPH_API_KEY;
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'X-Client': 'workflow-orchestrator'
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        code: 'UNKNOWN_ERROR',
        message: `HTTP ${response.status}: ${response.statusText}`
      }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
  }

  async createFlow(flow: Omit<LangGraphFlow, 'id' | 'created_at' | 'updated_at'>): Promise<LangGraphFlow> {
    const response = await fetch(`${this.baseUrl}/api/langgraph/flows`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(flow)
    });

    return this.handleResponse<LangGraphFlow>(response);
  }

  async getFlow(flowId: string): Promise<LangGraphFlow> {
    const response = await fetch(`${this.baseUrl}/api/langgraph/flows/${flowId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse<LangGraphFlow>(response);
  }

  async listFlows(): Promise<LangGraphFlow[]> {
    const response = await fetch(`${this.baseUrl}/api/langgraph/flows`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse<LangGraphFlow[]>(response);
  }

  async updateFlow(flowId: string, updates: Partial<LangGraphFlow>): Promise<LangGraphFlow> {
    const response = await fetch(`${this.baseUrl}/api/langgraph/flows/${flowId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates)
    });

    return this.handleResponse<LangGraphFlow>(response);
  }

  async deleteFlow(flowId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/langgraph/flows/${flowId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to delete flow: ${response.statusText}`);
    }
  }

  async executeFlow(request: ExecutionRequest): Promise<ExecutionResponse> {
    const response = await fetch(`${this.baseUrl}/api/langgraph/execute`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request)
    });

    return this.handleResponse<ExecutionResponse>(response);
  }

  async getExecution(executionId: string): Promise<ExecutionResponse> {
    const response = await fetch(`${this.baseUrl}/api/langgraph/executions/${executionId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse<ExecutionResponse>(response);
  }

  async cancelExecution(executionId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/langgraph/executions/${executionId}/cancel`, {
      method: 'POST',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to cancel execution: ${response.statusText}`);
    }
  }

  async streamExecution(
    request: ExecutionRequest,
    onEvent: (event: StreamEvent) => void
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/langgraph/stream`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to start stream: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Stream not available');
    }

    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const eventData = JSON.parse(line.slice(6));
            onEvent(eventData);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async createVersion(flowId: string, version: string): Promise<FlowVersion> {
    const response = await fetch(`${this.baseUrl}/api/langgraph/flows/${flowId}/versions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ version })
    });

    return this.handleResponse<FlowVersion>(response);
  }

  async listVersions(flowId: string): Promise<FlowVersion[]> {
    const response = await fetch(`${this.baseUrl}/api/langgraph/flows/${flowId}/versions`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse<FlowVersion[]>(response);
  }

  async getVersion(flowId: string, version: string): Promise<FlowVersion> {
    const response = await fetch(`${this.baseUrl}/api/langgraph/flows/${flowId}/versions/${version}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse<FlowVersion>(response);
  }

  async setActiveVersion(flowId: string, version: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/langgraph/flows/${flowId}/versions/${version}/activate`, {
      method: 'POST',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to activate version: ${response.statusText}`);
    }
  }

  async executeWithRetry(
    request: ExecutionRequest,
    maxRetries: number = 3
  ): Promise<ExecutionResponse> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.executeFlow(request);
      } catch (error) {
        lastError = error as Error;
        console.warn(`Execution attempt ${attempt + 1} failed:`, error);

        if (attempt < maxRetries - 1) {
          const backoffMs = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
      }
    }

    throw lastError || new Error('Execution failed after retries');
  }

  async waitForCompletion(
    executionId: string,
    pollIntervalMs: number = 1000,
    timeoutMs: number = 300000
  ): Promise<ExecutionResponse> {
    const startTime = Date.now();

    while (true) {
      const execution = await this.getExecution(executionId);

      if (execution.status === 'completed' || execution.status === 'failed') {
        return execution;
      }

      if (Date.now() - startTime > timeoutMs) {
        throw new Error('Execution timeout');
      }

      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  isHealthy(): Promise<boolean> {
    return fetch(`${this.baseUrl}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(response => response.ok)
      .catch(() => false);
  }
}

export const langGraphApiService = new LangGraphApiService();
export { LangGraphApiService };
