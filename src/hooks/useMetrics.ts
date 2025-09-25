import { useState, useEffect } from 'react';
import { ABTestMetrics, TimeFilter, ArmStatistics } from '../types/abtest';
import { abTestApiService } from '../services/abTestApiService';


export function useMetrics(testId: string, timeFilter: TimeFilter) {
  const [metrics, setMetrics] = useState<ABTestMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await abTestApiService.getMetrics(testId, timeFilter.value);
        if (response.success && response.data) {
          setMetrics(response.data.metrics);
        } else {
          throw new Error(response.message || 'Failed to fetch metrics');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
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