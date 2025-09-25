import { useState, useEffect } from 'react';
import { ExecutionLog, ServiceStep, ActivityExecution } from '../types/abtest';

// Mock logs generator
const generateMockLogs = (testId: string, count: number = 200): ExecutionLog[] => {
  const armKeys = ['a', 'b'];
  const armNames = ['Standard Flow', 'Optimized Flow'];
  const errorTypes = ['TimeoutException', 'ValidationError', 'NetworkError', 'BusinessRuleViolation'];
  
  return Array.from({ length: count }, (_, i) => {
    const armIndex = Math.random() > 0.5 ? 0 : 1;
    const armKey = armKeys[armIndex];
    const armName = armNames[armIndex];
    const status = Math.random() > 0.1 ? 'success' : 'error';
    const services = ['User Service', 'Payment Service', 'Inventory Service', 'Notification Service'];
    const selectedService = services[Math.floor(Math.random() * services.length)];
    
    // Generate service steps
    const serviceSteps: ServiceStep[] = [
      {
        id: `step-${i}-1`,
        serviceName: 'User Validation Service',
        method: 'POST',
        url: 'https://api.example.com/validate-user',
        status: 'success',
        duration: Math.floor(Math.random() * 200) + 50,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        retryCount: 0,
        request: {
          userId: `user-${Math.floor(Math.random() * 1000)}`,
          email: 'user@example.com'
        },
        response: {
          valid: true,
          tier: 'premium'
        }
      },
      {
        id: `step-${i}-2`,
        serviceName: selectedService,
        method: 'POST',
        url: `https://api.example.com/${selectedService.toLowerCase().replace(' ', '-')}`,
        status,
        duration: Math.floor(Math.random() * 500) + 100,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        retryCount: status === 'error' ? Math.floor(Math.random() * 3) : 0,
        errorType: status === 'error' ? errorTypes[Math.floor(Math.random() * errorTypes.length)] : undefined,
        request: {
          amount: 99.99,
          currency: 'USD'
        },
        response: status === 'success' ? {
          transactionId: `txn-${Math.floor(Math.random() * 10000)}`,
          status: 'completed'
        } : {
          error: 'Service failed',
          code: 'SERVICE_ERROR'
        }
      }
    ];
    
    // Generate activity executions
    const activityExecutions: ActivityExecution[] = [
      {
        activityId: 'start_event',
        activityName: 'Start Event',
        status: 'success',
        startTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000 + 50).toISOString(),
        duration: 50,
        inputData: { processStarted: true }
      },
      {
        activityId: 'validate_request',
        activityName: 'Validate Request',
        status: 'success',
        startTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000 + 50).toISOString(),
        endTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000 + 250).toISOString(),
        duration: 200,
        inputData: { requestData: 'sample' },
        outputData: { validated: true }
      }
    ];
    
    return {
      id: `log-${testId}-${i}`,
      testId,
      armKey,
      armName,
      status,
      duration: serviceSteps.reduce((sum, step) => sum + step.duration, 0),
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      errorMessage: status === 'error' ? 'Service execution failed' : undefined,
      errorType: status === 'error' ? errorTypes[Math.floor(Math.random() * errorTypes.length)] : undefined,
      serviceName: selectedService,
      serviceSteps,
      retryCount: status === 'error' ? Math.floor(Math.random() * 3) : 0,
      queueTime: Math.floor(Math.random() * 100),
      processInstanceId: `pi-${Math.floor(Math.random() * 10000)}`,
      activityExecutions
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