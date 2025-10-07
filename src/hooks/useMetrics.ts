import { useState, useEffect } from 'react';
import { ABTestMetrics, TimeFilter, ArmStatistics } from '../types/abtest';
import { abTestService } from '../services/abTestService';


export function useMetrics(testId: string, timeFilter: TimeFilter) {
  const [metrics, setMetrics] = useState<ABTestMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await abTestService.getMetrics(testId, timeFilter.value);
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
        setMetrics(null);
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