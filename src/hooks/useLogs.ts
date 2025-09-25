import { useState, useEffect } from 'react';
import { ExecutionLog, ServiceStep, ActivityExecution } from '../types/abtest';
import { abTestApiService } from '../services/abTestApiService';

export function useLogs(testId: string) {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await abTestApiService.getLogs(testId, 0, 200);
        if (response.success && response.data) {
          setLogs(response.data.logs);
        } else {
          throw new Error(response.message || 'Failed to fetch logs');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch logs');
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      fetchLogs();
    }
  }, [testId]);

  return { logs, loading, error };
}