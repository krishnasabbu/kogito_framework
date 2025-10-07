import { useState, useEffect } from 'react';
import { ExecutionLog, ServiceStep, ActivityExecution } from '../types/abtest';
import { abTestService } from '../services/abTestService';

export function useLogs(testId: string) {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const data = await abTestService.getLogs(testId, 0, 200);
        setLogs(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch logs');
        setLogs([]);
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