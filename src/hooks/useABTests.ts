import { useState, useEffect } from 'react';
import { ABTestConfig, ABTestArm } from '../types/abtest';
import { listenerGenerator } from '../services/listenerGenerator';

// Mock data
let mockABTests: ABTestConfig[] = [
  {
    id: 'test-1',
    name: 'Order Processing Optimization',
    description: 'Testing standard vs optimized order processing flow',
    springProjectPath: '/home/project/spring-boot-app',
    arms: [
      {
        armKey: 'a',
        armName: 'Standard Flow',
        bpmnFile: 'order-processing-v1.bpmn',
        processDefinitionKey: 'order_processing_v1'
      },
      {
        armKey: 'b', 
        armName: 'Optimized Flow',
        bpmnFile: 'order-processing-v2.bpmn',
        processDefinitionKey: 'order_processing_v2'
      }
    ],
    trafficSplit: 50,
    generateListener: true,
    listenerConfig: {
      packageName: 'com.flowforge.listener',
      className: 'OrderProcessingABTestListener',
      filePath: '/home/project/spring-boot-app/src/main/java/com/flowforge/listener/OrderProcessingABTestListener.java',
      generated: true
    },
    status: 'running',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-25T15:30:00Z'
  },
  {
    id: 'test-2',
    name: 'Payment Gateway Comparison',
    description: 'Comparing different payment gateway implementations',
    springProjectPath: '/home/project/payment-service',
    arms: [
      {
        armKey: 'a',
        armName: 'Payment Gateway A',
        bpmnFile: 'payment-flow-standard.bpmn',
        processDefinitionKey: 'payment_flow_standard'
      },
      {
        armKey: 'b',
        armName: 'Payment Gateway B', 
        bpmnFile: 'payment-flow-optimized.bpmn',
        processDefinitionKey: 'payment_flow_optimized'
      }
    ],
    trafficSplit: 30,
    generateListener: true,
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
      // Generate listener if requested
      let listenerConfig = undefined;
      if (testData.generateListener) {
        const tempTest = {
          ...testData,
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const { code, config } = listenerGenerator.generateListener(tempTest);
        
        // In a real implementation, this would inject the listener into the project
        const injected = await listenerGenerator.injectListener(tempTest, code, config);
        
        if (injected) {
          listenerConfig = { ...config, generated: true };
        }
      }
      
      const newTest: ABTestConfig = {
        ...testData,
        id: `test-${Date.now()}`,
        listenerConfig,
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