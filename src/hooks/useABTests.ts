import { useState, useEffect } from 'react';
import { ABTestConfig } from '../types/abtest';

// Mock data
const mockABTests: ABTestConfig[] = [
  {
    id: 'test-1',
    name: 'Order Processing Optimization',
    optionA: {
      name: 'Standard Flow',
      bpmnFile: 'standard-order-flow.bpmn'
    },
    optionB: {
      name: 'Optimized Flow',
      bpmnFile: 'optimized-order-flow.bpmn'
    },
    trafficSplit: 50,
    status: 'running',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-25T15:30:00Z'
  },
  {
    id: 'test-2',
    name: 'Payment Gateway Comparison',
    optionA: {
      name: 'Gateway A',
      bpmnFile: 'payment-gateway-a.bpmn'
    },
    optionB: {
      name: 'Gateway B',
      bpmnFile: 'payment-gateway-b.bpmn'
    },
    trafficSplit: 30,
    status: 'stopped',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-22T11:45:00Z'
  }
];

export function useABTests() {
  const [tests, setTests] = useState<ABTestConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    const fetchTests = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setTests(mockABTests);
      } catch (err) {
        setError('Failed to fetch A/B tests');
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const createTest = async (testData: Omit<ABTestConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTest: ABTestConfig = {
        ...testData,
        id: `test-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      mockABTests.push(newTest);
      setTests([...mockABTests]);
      return newTest;
    } catch (err) {
      throw new Error('Failed to create A/B test');
    }
  };

  const updateTest = async (id: string, updates: Partial<ABTestConfig>) => {
    try {
      const index = mockABTests.findIndex(t => t.id === id);
      if (index !== -1) {
        mockABTests[index] = {
          ...mockABTests[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        setTests([...mockABTests]);
      }
    } catch (err) {
      throw new Error('Failed to update A/B test');
    }
  };

  return {
    tests,
    loading,
    error,
    createTest,
    updateTest
  };
}