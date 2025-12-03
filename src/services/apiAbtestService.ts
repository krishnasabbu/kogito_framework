import {
  ApiABTest,
  ApiABTestExecution,
  ApiABTestMetrics,
  ApiVariantStats,
  CreateApiABTestRequest,
  ExecuteApiABTestRequest,
  ApiTimeSeriesPoint
} from '../types/apiAbtest';

class ApiABTestService {
  private mockTests: ApiABTest[] = [];
  private mockExecutions: Map<string, ApiABTestExecution[]> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const test1Id = 'test-1';
    const test2Id = 'test-2';
    const test3Id = 'test-3';

    this.mockTests = [
      {
        id: test1Id,
        name: 'Payment Gateway Comparison',
        description: 'Testing Stripe vs Braintree for payment processing',
        status: 'running',
        variants: [
          {
            id: 'var-1a',
            name: 'Stripe API',
            description: 'Current payment provider',
            apiEndpoint: 'https://api.stripe.com/v1/charges',
            headers: { 'Authorization': 'Bearer sk_test_...' },
            trafficPercentage: 50,
            isControl: true
          },
          {
            id: 'var-1b',
            name: 'Braintree API',
            description: 'Alternative payment provider',
            apiEndpoint: 'https://api.braintreegateway.com/payments',
            headers: { 'Authorization': 'Basic ...' },
            trafficPercentage: 50,
            isControl: false
          }
        ],
        trafficSplit: 50,
        method: 'POST',
        requestPayload: {
          amount: 100,
          currency: 'USD',
          cardToken: 'tok_123'
        },
        headers: {
          'Content-Type': 'application/json'
        },
        successCriteria: {
          primaryMetric: 'latency',
          minimumSampleSize: 500,
          confidenceLevel: 95,
          minimumDetectableEffect: 10,
          maxDurationDays: 7
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        createdBy: 'user@example.com'
      },
      {
        id: test2Id,
        name: 'API Gateway Load Balancer',
        description: 'Testing different geographic regions for optimal latency',
        status: 'running',
        variants: [
          {
            id: 'var-2a',
            name: 'US East',
            apiEndpoint: 'https://api-us-east.example.com/data',
            trafficPercentage: 34,
            isControl: true
          },
          {
            id: 'var-2b',
            name: 'US West',
            apiEndpoint: 'https://api-us-west.example.com/data',
            trafficPercentage: 33,
            isControl: false
          },
          {
            id: 'var-2c',
            name: 'EU Central',
            apiEndpoint: 'https://api-eu.example.com/data',
            trafficPercentage: 33,
            isControl: false
          }
        ],
        trafficSplit: 34,
        method: 'GET',
        successCriteria: {
          primaryMetric: 'latency',
          minimumSampleSize: 300,
          confidenceLevel: 95,
          minimumDetectableEffect: 15,
          maxDurationDays: 3
        },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        createdBy: 'user@example.com'
      },
      {
        id: test3Id,
        name: 'Authentication Service Migration',
        description: 'Migrating from legacy auth to new OAuth2 service',
        status: 'draft',
        variants: [
          {
            id: 'var-3a',
            name: 'Legacy Auth',
            apiEndpoint: 'https://auth.old.example.com/login',
            trafficPercentage: 80,
            isControl: true
          },
          {
            id: 'var-3b',
            name: 'OAuth2 Service',
            apiEndpoint: 'https://oauth.new.example.com/v2/token',
            trafficPercentage: 20,
            isControl: false
          }
        ],
        trafficSplit: 80,
        method: 'POST',
        requestPayload: {
          username: 'user@example.com',
          password: '***'
        },
        successCriteria: {
          primaryMetric: 'success_rate',
          minimumSampleSize: 1000,
          confidenceLevel: 99,
          minimumDetectableEffect: 5,
          maxDurationDays: 14
        },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000),
        createdBy: 'user@example.com'
      }
    ];

    this.generateMockExecutions(test1Id, this.mockTests[0].variants, 450);
    this.generateMockExecutions(test2Id, this.mockTests[1].variants, 280);
  }

  private generateMockExecutions(testId: string, variants: any[], count: number) {
    const executions: ApiABTestExecution[] = [];
    const now = Date.now();
    const timeSpan = 2 * 24 * 60 * 60 * 1000;

    for (let i = 0; i < count; i++) {
      const variant = variants[Math.floor(Math.random() * variants.length)];
      const timestamp = new Date(now - Math.random() * timeSpan);

      let latencyMs: number;
      let statusCode: number;
      let status: 'success' | 'error';

      if (variant.name.includes('Stripe') || variant.name.includes('Legacy') || variant.name.includes('US East')) {
        latencyMs = Math.floor(200 + Math.random() * 100);
        statusCode = Math.random() > 0.04 ? 200 : 500;
      } else {
        latencyMs = Math.floor(150 + Math.random() * 80);
        statusCode = Math.random() > 0.02 ? 200 : 500;
      }

      status = statusCode === 200 ? 'success' : 'error';

      executions.push({
        id: `exec-${testId}-${i}`,
        testId,
        variantId: variant.id,
        variantName: variant.name,
        status,
        latencyMs,
        statusCode,
        requestPayload: { test: 'data' },
        responsePayload: status === 'success' ? { success: true } : { error: 'Internal error' },
        errorMessage: status === 'error' ? 'Internal server error' : undefined,
        timestamp
      });
    }

    this.mockExecutions.set(testId, executions.sort((a, b) =>
      b.timestamp.getTime() - a.timestamp.getTime()
    ));
  }

  async createTest(request: CreateApiABTestRequest): Promise<ApiABTest> {
    const test: ApiABTest = {
      id: `test-${Date.now()}`,
      name: request.name,
      description: request.description,
      status: 'draft',
      variants: request.variants.map(v => ({
        id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: v.name,
        description: v.description,
        apiEndpoint: v.apiEndpoint,
        headers: v.headers,
        trafficPercentage: v.trafficPercentage,
        isControl: v.isControl
      })),
      trafficSplit: request.trafficSplit,
      method: request.method,
      requestPayload: request.requestPayload,
      headers: request.headers,
      successCriteria: request.successCriteria,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user'
    };

    this.mockTests.unshift(test);
    this.mockExecutions.set(test.id, []);

    return test;
  }

  async getAllTests(): Promise<ApiABTest[]> {
    return [...this.mockTests];
  }

  async getTest(testId: string): Promise<ApiABTest | null> {
    return this.mockTests.find(t => t.id === testId) || null;
  }

  async startTest(testId: string): Promise<ApiABTest> {
    const test = this.mockTests.find(t => t.id === testId);
    if (test) {
      test.status = 'running';
      test.updatedAt = new Date();
    }
    return test!;
  }

  async pauseTest(testId: string): Promise<ApiABTest> {
    const test = this.mockTests.find(t => t.id === testId);
    if (test) {
      test.status = 'paused';
      test.updatedAt = new Date();
    }
    return test!;
  }

  async deleteTest(testId: string): Promise<void> {
    this.mockTests = this.mockTests.filter(t => t.id !== testId);
    this.mockExecutions.delete(testId);
  }

  selectVariant(test: ApiABTest): { variantId: string; variant: any } {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const variant of test.variants) {
      cumulative += variant.trafficPercentage;
      if (random <= cumulative) {
        return { variantId: variant.id, variant };
      }
    }

    return { variantId: test.variants[0].id, variant: test.variants[0] };
  }

  async executeTest(request: ExecuteApiABTestRequest): Promise<ApiABTestExecution> {
    const test = await this.getTest(request.testId);
    if (!test) throw new Error('Test not found');

    if (test.status !== 'running') {
      throw new Error('Test is not running');
    }

    const { variantId, variant } = this.selectVariant(test);

    const latencyMs = Math.floor(150 + Math.random() * 150);
    const statusCode = Math.random() > 0.03 ? 200 : 500;
    const status: 'success' | 'error' = statusCode === 200 ? 'success' : 'error';

    const execution: ApiABTestExecution = {
      id: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      testId: test.id,
      variantId,
      variantName: variant.name,
      status,
      latencyMs,
      statusCode,
      requestPayload: request.requestPayload || test.requestPayload,
      responsePayload: status === 'success' ? { success: true, data: {} } : { error: 'Failed' },
      errorMessage: status === 'error' ? 'Execution failed' : undefined,
      timestamp: new Date()
    };

    const executions = this.mockExecutions.get(test.id) || [];
    executions.unshift(execution);
    this.mockExecutions.set(test.id, executions);

    return execution;
  }

  async getMetrics(testId: string, timeFilter?: string): Promise<ApiABTestMetrics> {
    const executions = this.mockExecutions.get(testId) || [];

    if (executions.length === 0) {
      return {
        testId,
        totalExecutions: 0,
        variantStats: {},
        timeSeriesData: [],
        latencyPercentiles: {},
        statusCodeDistribution: {}
      };
    }

    const test = await this.getTest(testId);
    if (!test) {
      throw new Error('Test not found');
    }

    let filteredExecutions = [...executions];

    if (timeFilter) {
      const now = new Date();
      const startDate = new Date();

      switch (timeFilter) {
        case '1h':
          startDate.setHours(now.getHours() - 1);
          break;
        case '24h':
          startDate.setHours(now.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
      }

      filteredExecutions = filteredExecutions.filter(e => e.timestamp >= startDate);
    }

    const variantStats: Record<string, ApiVariantStats> = {};
    const variantExecutions: Record<string, ApiABTestExecution[]> = {};

    filteredExecutions.forEach(exec => {
      if (!variantExecutions[exec.variantId]) {
        variantExecutions[exec.variantId] = [];
      }
      variantExecutions[exec.variantId].push(exec);
    });

    Object.entries(variantExecutions).forEach(([variantId, execs]) => {
      const latencies = execs.map(e => e.latencyMs).sort((a, b) => a - b);
      const successes = execs.filter(e => e.status === 'success').length;
      const statusCodes: Record<number, number> = {};

      execs.forEach(e => {
        statusCodes[e.statusCode] = (statusCodes[e.statusCode] || 0) + 1;
      });

      const variant = test.variants.find(v => v.id === variantId);

      variantStats[variantId] = {
        variantId,
        variantName: variant?.name || execs[0].variantName,
        executions: execs.length,
        successRate: successes / execs.length,
        errorRate: 1 - (successes / execs.length),
        avgLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
        p50Latency: latencies[Math.floor(latencies.length * 0.5)] || 0,
        p95Latency: latencies[Math.floor(latencies.length * 0.95)] || 0,
        p99Latency: latencies[Math.floor(latencies.length * 0.99)] || 0,
        minLatency: Math.min(...latencies),
        maxLatency: Math.max(...latencies),
        throughput: execs.length / (24 * 3600),
        statusCodes
      };
    });

    const timeSeriesData = this.generateTimeSeries(filteredExecutions, test.variants);

    return {
      testId,
      totalExecutions: filteredExecutions.length,
      variantStats,
      timeSeriesData,
      latencyPercentiles: Object.fromEntries(
        Object.entries(variantStats).map(([id, stats]) => [
          id,
          {
            p50: stats.p50Latency,
            p90: Math.floor(stats.p95Latency * 0.95),
            p95: stats.p95Latency,
            p99: stats.p99Latency
          }
        ])
      ),
      statusCodeDistribution: Object.fromEntries(
        Object.entries(variantStats).map(([id, stats]) => [
          id,
          Object.entries(stats.statusCodes).map(([code, count]) => ({
            code: Number(code),
            count,
            percentage: (count / stats.executions) * 100
          }))
        ])
      )
    };
  }

  private generateTimeSeries(executions: ApiABTestExecution[], variants: any[]): ApiTimeSeriesPoint[] {
    const buckets: Record<string, Record<string, ApiABTestExecution[]>> = {};

    executions.forEach(exec => {
      const timestamp = new Date(exec.timestamp);
      const bucketKey = new Date(
        timestamp.getFullYear(),
        timestamp.getMonth(),
        timestamp.getDate(),
        timestamp.getHours(),
        Math.floor(timestamp.getMinutes() / 15) * 15
      ).toISOString();

      if (!buckets[bucketKey]) {
        buckets[bucketKey] = {};
      }

      if (!buckets[bucketKey][exec.variantId]) {
        buckets[bucketKey][exec.variantId] = [];
      }

      buckets[bucketKey][exec.variantId].push(exec);
    });

    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([timestamp, variantData]) => ({
        timestamp,
        variantData: Object.fromEntries(
          Object.entries(variantData).map(([variantId, execs]) => [
            variantId,
            {
              requests: execs.length,
              avgLatency: execs.reduce((sum, e) => sum + e.latencyMs, 0) / execs.length,
              successRate: execs.filter(e => e.status === 'success').length / execs.length,
              errors: execs.filter(e => e.status === 'error').length
            }
          ])
        )
      }));
  }

  async getExecutions(testId: string, limit: number = 100): Promise<ApiABTestExecution[]> {
    const executions = this.mockExecutions.get(testId) || [];
    return executions.slice(0, limit);
  }
}

export const apiABTestService = new ApiABTestService();
export { ApiABTestService };
