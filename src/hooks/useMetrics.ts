import { useState, useEffect } from 'react';
import { ABTestMetrics, TimeFilter, ArmStatistics } from '../types/abtest';

// Mock metrics data generator
const generateMockMetrics = (testId: string, armKeys: string[] = ['a', 'b']): ABTestMetrics => {
  const totalRuns = Math.floor(Math.random() * 10000) + 5000;
  
  // Generate arm statistics dynamically
  const armStats: Record<string, ArmStatistics> = {};
  armKeys.forEach((key, index) => {
    const runs = Math.floor(totalRuns * (0.4 + Math.random() * 0.2));
    armStats[key] = {
      armKey: key,
      armName: `Test Arm ${key.toUpperCase()}`,
      runs,
      successRate: 0.85 + Math.random() * 0.14,
      errorRate: 0.01 + Math.random() * 0.04,
      avgDuration: 800 + Math.random() * 1200,
      minDuration: 200 + Math.random() * 300,
      maxDuration: 2000 + Math.random() * 3000,
      totalDuration: runs * (800 + Math.random() * 1200),
      retryCount: Math.floor(runs * 0.05),
      queueTime: 50 + Math.random() * 200
    };
  });

  // Generate enhanced time series data
  const timeSeriesData = Array.from({ length: 48 }, (_, i) => {
    const timestamp = new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString();
    const armData: Record<string, any> = {};
    
    armKeys.forEach(key => {
      armData[key] = {
        requests: Math.floor(Math.random() * 100) + 20,
        success: Math.floor(Math.random() * 90) + 10,
        errors: Math.floor(Math.random() * 10),
        avgDuration: 800 + Math.random() * 400
      };
    });
    
    return {
      timestamp,
      armData
    };
  });

  // Generate latency percentiles
  const latencyPercentiles = {
    p50: {},
    p90: {},
    p95: {},
    p99: {}
  };
  
  armKeys.forEach(key => {
    latencyPercentiles.p50[key] = 400 + Math.random() * 200;
    latencyPercentiles.p90[key] = 800 + Math.random() * 400;
    latencyPercentiles.p95[key] = 1200 + Math.random() * 600;
    latencyPercentiles.p99[key] = 2000 + Math.random() * 1000;
  });

  // Generate throughput metrics
  const throughputMetrics = {
    rps: {},
    peakRps: {},
    avgRps: {},
    totalRequests: {}
  };
  
  armKeys.forEach(key => {
    throughputMetrics.rps[key] = 10 + Math.random() * 50;
    throughputMetrics.peakRps[key] = 50 + Math.random() * 100;
    throughputMetrics.avgRps[key] = 20 + Math.random() * 30;
    throughputMetrics.totalRequests[key] = armStats[key].runs;
  });

  // Generate SLA metrics
  const slaMetrics = {
    slaThreshold: 2000,
    breaches: {},
    complianceRate: {},
    avgResponseTime: {}
  };
  
  armKeys.forEach(key => {
    slaMetrics.breaches[key] = Math.floor(armStats[key].runs * 0.05);
    slaMetrics.complianceRate[key] = 0.92 + Math.random() * 0.07;
    slaMetrics.avgResponseTime[key] = armStats[key].avgDuration;
  });

  // Generate concurrency metrics
  const concurrencyMetrics = {
    maxConcurrent: {},
    avgConcurrent: {},
    queueTime: {},
    waitTime: {}
  };
  
  armKeys.forEach(key => {
    concurrencyMetrics.maxConcurrent[key] = 5 + Math.floor(Math.random() * 15);
    concurrencyMetrics.avgConcurrent[key] = 2 + Math.random() * 5;
    concurrencyMetrics.queueTime[key] = armStats[key].queueTime;
    concurrencyMetrics.waitTime[key] = 20 + Math.random() * 100;
  });

  // Generate error breakdown
  const errorTypes = ['TimeoutException', 'ValidationError', 'NetworkError', 'BusinessRuleViolation'];
  const errorBreakdown = errorTypes.map(errorType => ({
    errorType,
    count: armKeys.reduce((acc, key) => ({
      ...acc,
      [key]: Math.floor(Math.random() * 20)
    }), {}),
    percentage: armKeys.reduce((acc, key) => ({
      ...acc,
      [key]: Math.random() * 5
    }), {})
  }));

  // Generate activity performance
  const activities = ['Start Event', 'Validate Request', 'Process Payment', 'Send Notification', 'End Event'];
  const activityPerformance = activities.map(activityName => ({
    activityId: activityName.toLowerCase().replace(/\s+/g, '_'),
    activityName,
    avgDuration: armKeys.reduce((acc, key) => ({
      ...acc,
      [key]: 100 + Math.random() * 500
    }), {}),
    errorRate: armKeys.reduce((acc, key) => ({
      ...acc,
      [key]: Math.random() * 0.1
    }), {}),
    executionCount: armKeys.reduce((acc, key) => ({
      ...acc,
      [key]: Math.floor(armStats[key].runs * 0.8)
    }), {})
  }));
  return {
    testId,
    totalRuns,
    armStats,
    timeSeriesData,
    serviceExecutions: [
      { 
        serviceName: 'User Service', 
        armCounts: armKeys.reduce((acc, key) => ({ ...acc, [key]: 400 + Math.floor(Math.random() * 200) }), {})
      },
      { 
        serviceName: 'Payment Service', 
        armCounts: armKeys.reduce((acc, key) => ({ ...acc, [key]: 350 + Math.floor(Math.random() * 150) }), {})
      },
      { 
        serviceName: 'Inventory Service', 
        armCounts: armKeys.reduce((acc, key) => ({ ...acc, [key]: 300 + Math.floor(Math.random() * 100) }), {})
      }
    ],
    latencyPercentiles,
    throughputMetrics,
    slaMetrics,
    concurrencyMetrics,
    errorBreakdown,
    activityPerformance
  };
};

export function useMetrics(testId: string, timeFilter: TimeFilter) {
  const [metrics, setMetrics] = useState<ABTestMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockMetrics = generateMockMetrics(testId);
        
        // Filter time series data based on time filter
        const cutoffTime = new Date(Date.now() - timeFilter.minutes * 60 * 1000);
        mockMetrics.timeSeriesData = mockMetrics.timeSeriesData.filter(
          point => new Date(point.timestamp) >= cutoffTime
        );
        
        setMetrics(mockMetrics);
      } catch (err) {
        setError('Failed to fetch metrics');
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      fetchMetrics();
    }
  }, [testId, timeFilter]);

  return { metrics, loading, error };
}