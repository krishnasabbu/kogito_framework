import { useState, useEffect } from 'react';
import { ABTestMetrics, TimeFilter } from '../types/abtest';

// Mock metrics data generator
const generateMockMetrics = (testId: string): ABTestMetrics => {
  const totalRuns = Math.floor(Math.random() * 10000) + 1000;
  const optionARuns = Math.floor(totalRuns * 0.5);
  const optionBRuns = totalRuns - optionARuns;

  // Generate time series data for last 24 hours
  const timeSeriesData = Array.from({ length: 24 }, (_, i) => {
    const timestamp = new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString();
    return {
      timestamp,
      optionARequests: Math.floor(Math.random() * 100) + 10,
      optionBRequests: Math.floor(Math.random() * 100) + 10,
      optionASuccess: Math.floor(Math.random() * 90) + 5,
      optionBSuccess: Math.floor(Math.random() * 95) + 5,
    };
  });

  return {
    testId,
    totalRuns,
    optionAStats: {
      runs: optionARuns,
      successRate: 0.94 + Math.random() * 0.05,
      errorRate: 0.02 + Math.random() * 0.03,
      avgDuration: 1200 + Math.random() * 800
    },
    optionBStats: {
      runs: optionBRuns,
      successRate: 0.96 + Math.random() * 0.03,
      errorRate: 0.01 + Math.random() * 0.02,
      avgDuration: 1000 + Math.random() * 600
    },
    timeSeriesData,
    serviceExecutions: [
      { serviceName: 'User Service', optionACount: 450, optionBCount: 520 },
      { serviceName: 'Payment Service', optionACount: 380, optionBCount: 410 },
      { serviceName: 'Inventory Service', optionACount: 290, optionBCount: 340 },
      { serviceName: 'Notification Service', optionACount: 200, optionBCount: 180 }
    ]
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