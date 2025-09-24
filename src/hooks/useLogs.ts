import { useState, useEffect } from 'react';
import { ExecutionLog } from '../types/abtest';

// Mock logs generator
const generateMockLogs = (testId: string, count: number = 100): ExecutionLog[] => {
  return Array.from({ length: count }, (_, i) => {
    const option = Math.random() > 0.5 ? 'A' : 'B';
    const status = Math.random() > 0.1 ? 'success' : 'error';
    const services = ['User Service', 'Payment Service', 'Inventory Service', 'Notification Service'];
    
    return {
      id: `log-${testId}-${i}`,
      testId,
      option,
      status,
      duration: Math.floor(Math.random() * 3000) + 200,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      errorMessage: status === 'error' ? 'Service timeout' : undefined,
      serviceName: services[Math.floor(Math.random() * services.length)],
      serviceSteps: []
    };
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export function useLogs(testId: string) {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 600));
        const mockLogs = generateMockLogs(testId);
        setLogs(mockLogs);
      } catch (err) {
        setError('Failed to fetch logs');
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