import {
  ApiABTest,
  ApiABTestExecution,
  ApiABTestMetrics,
  ApiVariantStats,
  CreateApiABTestRequest,
  ExecuteApiABTestRequest,
  ApiTimeSeriesPoint
} from '../types/apiAbtest';
import { supabase } from '../lib/supabaseClient';

class ApiABTestService {
  async createTest(request: CreateApiABTestRequest): Promise<ApiABTest> {
    const test: ApiABTest = {
      id: crypto.randomUUID(),
      name: request.name,
      description: request.description,
      status: 'draft',
      variants: request.variants.map(v => ({
        id: crypto.randomUUID(),
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

    const { error } = await supabase
      .from('api_ab_tests')
      .insert({
        id: test.id,
        name: test.name,
        description: test.description,
        status: test.status,
        variants: test.variants,
        traffic_split: test.trafficSplit,
        method: test.method,
        request_payload: test.requestPayload,
        headers: test.headers,
        success_criteria: test.successCriteria,
        created_by: test.createdBy
      });

    if (error) {
      console.error('Failed to save test to database:', error);
    }

    return test;
  }

  async getAllTests(): Promise<ApiABTest[]> {
    const { data, error } = await supabase
      .from('api_ab_tests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch tests:', error);
      return [];
    }

    return data.map(d => ({
      id: d.id,
      name: d.name,
      description: d.description,
      status: d.status,
      variants: d.variants,
      trafficSplit: d.traffic_split,
      method: d.method,
      requestPayload: d.request_payload,
      headers: d.headers,
      successCriteria: d.success_criteria,
      createdAt: new Date(d.created_at),
      updatedAt: new Date(d.updated_at),
      createdBy: d.created_by
    }));
  }

  async getTest(testId: string): Promise<ApiABTest | null> {
    const { data, error } = await supabase
      .from('api_ab_tests')
      .select('*')
      .eq('id', testId)
      .maybeSingle();

    if (error || !data) {
      console.error('Failed to fetch test:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      status: data.status,
      variants: data.variants,
      trafficSplit: data.traffic_split,
      method: data.method,
      requestPayload: data.request_payload,
      headers: data.headers,
      successCriteria: data.success_criteria,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by
    };
  }

  async startTest(testId: string): Promise<ApiABTest> {
    const { data, error } = await supabase
      .from('api_ab_tests')
      .update({ status: 'running', updated_at: new Date().toISOString() })
      .eq('id', testId)
      .select()
      .single();

    if (error) throw new Error('Failed to start test');

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      status: data.status,
      variants: data.variants,
      trafficSplit: data.traffic_split,
      method: data.method,
      requestPayload: data.request_payload,
      headers: data.headers,
      successCriteria: data.success_criteria,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by
    };
  }

  async pauseTest(testId: string): Promise<ApiABTest> {
    const { data, error } = await supabase
      .from('api_ab_tests')
      .update({ status: 'paused', updated_at: new Date().toISOString() })
      .eq('id', testId)
      .select()
      .single();

    if (error) throw new Error('Failed to pause test');

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      status: data.status,
      variants: data.variants,
      trafficSplit: data.traffic_split,
      method: data.method,
      requestPayload: data.request_payload,
      headers: data.headers,
      successCriteria: data.success_criteria,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by
    };
  }

  async deleteTest(testId: string): Promise<void> {
    const { error } = await supabase
      .from('api_ab_tests')
      .delete()
      .eq('id', testId);

    if (error) throw new Error('Failed to delete test');
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

    const startTime = Date.now();
    let status: 'success' | 'error' = 'success';
    let statusCode = 200;
    let responsePayload: any = null;
    let errorMessage: string | undefined;

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...test.headers,
        ...variant.headers,
        ...request.overrideHeaders
      };

      const payload = request.requestPayload || test.requestPayload;

      const response = await fetch(variant.apiEndpoint, {
        method: test.method,
        headers,
        body: test.method !== 'GET' ? JSON.stringify(payload) : undefined
      });

      statusCode = response.status;

      if (!response.ok) {
        status = 'error';
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      responsePayload = await response.json().catch(() => response.text());

    } catch (error) {
      status = 'error';
      statusCode = 0;
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
      responsePayload = null;
    }

    const latencyMs = Date.now() - startTime;

    const execution: ApiABTestExecution = {
      id: crypto.randomUUID(),
      testId: test.id,
      variantId,
      variantName: variant.name,
      status,
      latencyMs,
      statusCode,
      requestPayload: request.requestPayload || test.requestPayload,
      responsePayload,
      errorMessage,
      timestamp: new Date()
    };

    const { error } = await supabase
      .from('api_ab_test_executions')
      .insert({
        id: execution.id,
        test_id: execution.testId,
        variant_id: execution.variantId,
        variant_name: execution.variantName,
        status: execution.status,
        latency_ms: execution.latencyMs,
        status_code: execution.statusCode,
        request_payload: execution.requestPayload,
        response_payload: execution.responsePayload,
        error_message: execution.errorMessage
      });

    if (error) {
      console.error('Failed to save execution:', error);
    }

    return execution;
  }

  async getMetrics(testId: string, timeFilter?: string): Promise<ApiABTestMetrics> {
    let query = supabase
      .from('api_ab_test_executions')
      .select('*')
      .eq('test_id', testId);

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

      query = query.gte('created_at', startDate.toISOString());
    }

    const { data: executions, error } = await query;

    if (error || !executions) {
      console.error('Failed to fetch executions:', error);
      return {
        testId,
        totalExecutions: 0,
        variantStats: {},
        timeSeriesData: [],
        latencyPercentiles: {},
        statusCodeDistribution: {}
      };
    }

    const variantStats: Record<string, ApiVariantStats> = {};
    const variantExecutions: Record<string, ApiABTestExecution[]> = {};

    executions.forEach(exec => {
      const execution: ApiABTestExecution = {
        id: exec.id,
        testId: exec.test_id,
        variantId: exec.variant_id,
        variantName: exec.variant_name,
        status: exec.status,
        latencyMs: exec.latency_ms,
        statusCode: exec.status_code,
        requestPayload: exec.request_payload,
        responsePayload: exec.response_payload,
        errorMessage: exec.error_message,
        timestamp: new Date(exec.created_at)
      };

      if (!variantExecutions[exec.variant_id]) {
        variantExecutions[exec.variant_id] = [];
      }
      variantExecutions[exec.variant_id].push(execution);
    });

    Object.entries(variantExecutions).forEach(([variantId, execs]) => {
      const latencies = execs.map(e => e.latencyMs).sort((a, b) => a - b);
      const successes = execs.filter(e => e.status === 'success').length;
      const statusCodes: Record<number, number> = {};

      execs.forEach(e => {
        statusCodes[e.statusCode] = (statusCodes[e.statusCode] || 0) + 1;
      });

      variantStats[variantId] = {
        variantId,
        variantName: execs[0].variantName,
        executions: execs.length,
        successRate: successes / execs.length,
        errorRate: 1 - (successes / execs.length),
        avgLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
        p50Latency: latencies[Math.floor(latencies.length * 0.5)],
        p95Latency: latencies[Math.floor(latencies.length * 0.95)],
        p99Latency: latencies[Math.floor(latencies.length * 0.99)],
        minLatency: Math.min(...latencies),
        maxLatency: Math.max(...latencies),
        throughput: execs.length / (24 * 3600),
        statusCodes
      };
    });

    const timeSeriesData = this.generateTimeSeries(executions);

    return {
      testId,
      totalExecutions: executions.length,
      variantStats,
      timeSeriesData,
      latencyPercentiles: Object.fromEntries(
        Object.entries(variantStats).map(([id, stats]) => [
          id,
          {
            p50: stats.p50Latency,
            p90: stats.p95Latency * 0.9,
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

  private generateTimeSeries(executions: any[]): ApiTimeSeriesPoint[] {
    const buckets: Record<string, Record<string, any[]>> = {};

    executions.forEach(exec => {
      const timestamp = new Date(exec.created_at);
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

      if (!buckets[bucketKey][exec.variant_id]) {
        buckets[bucketKey][exec.variant_id] = [];
      }

      buckets[bucketKey][exec.variant_id].push(exec);
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
              avgLatency: execs.reduce((sum: number, e: any) => sum + e.latency_ms, 0) / execs.length,
              successRate: execs.filter((e: any) => e.status === 'success').length / execs.length,
              errors: execs.filter((e: any) => e.status === 'error').length
            }
          ])
        )
      }));
  }

  async getExecutions(testId: string, limit: number = 100): Promise<ApiABTestExecution[]> {
    const { data, error } = await supabase
      .from('api_ab_test_executions')
      .select('*')
      .eq('test_id', testId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      console.error('Failed to fetch executions:', error);
      return [];
    }

    return data.map(d => ({
      id: d.id,
      testId: d.test_id,
      variantId: d.variant_id,
      variantName: d.variant_name,
      status: d.status,
      latencyMs: d.latency_ms,
      statusCode: d.status_code,
      requestPayload: d.request_payload,
      responsePayload: d.response_payload,
      errorMessage: d.error_message,
      timestamp: new Date(d.created_at)
    }));
  }
}

export const apiABTestService = new ApiABTestService();
export { ApiABTestService };
