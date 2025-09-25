import { useState, useEffect } from 'react';
import { ABTestConfig, ABTestArm } from '../types/abtest';
import { abTestApiService } from '../services/abTestApiService';


export function useABTests() {
  const [tests, setTests] = useState<ABTestConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const response = await abTestApiService.getAllABTests();
        if (response.success && response.data) {
          setTests(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch tests');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch A/B tests');
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const createTest = async (testData: Omit<ABTestConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const createRequest = {
        name: testData.name,
        description: testData.description,
        springProjectPath: testData.springProjectPath,
        arms: testData.arms.map(arm => ({
          armKey: arm.armKey,
          armName: arm.armName,
          bpmnFile: arm.bpmnFile,
          customLabel: arm.customLabel,
          processDefinitionKey: arm.processDefinitionKey
        })),
        trafficSplit: testData.trafficSplit,
        generateListener: testData.generateListener
      };

      const response = await abTestApiService.createABTest(createRequest);
      if (response.success && response.data) {
        const newTest: ABTestConfig = {
          ...testData,
          id: response.data.testId,
          listenerConfig: response.data.listenerGenerated ? {
            packageName: 'com.flowforge.listener',
            className: 'ABTestListener',
            filePath: response.data.listenerPath || '',
            generated: true
          } : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setTests(prev => [...prev, newTest]);
        return newTest;
      } else {
        throw new Error(response.data?.message || 'Failed to create test');
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create A/B test');
    }
  };

  const updateTest = async (id: string, updates: Partial<ABTestConfig>) => {
    try {
      const response = await abTestApiService.updateABTest(id, updates);
      if (response.success && response.data) {
        setTests(prev => prev.map(test => 
          test.id === id ? { ...test, ...response.data } : test
        ));
      } else {
        throw new Error(response.message || 'Failed to update test');
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update A/B test');
    }
  };

  const startTest = async (id: string) => {
    try {
      const response = await abTestApiService.startABTest(id);
      if (response.success) {
        setTests(prev => prev.map(test => 
          test.id === id ? { ...test, status: 'running', updatedAt: new Date().toISOString() } : test
        ));
      } else {
        throw new Error(response.message || 'Failed to start test');
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to start A/B test');
    }
  };

  const stopTest = async (id: string) => {
    try {
      const response = await abTestApiService.stopABTest(id);
      if (response.success) {
        setTests(prev => prev.map(test => 
          test.id === id ? { ...test, status: 'stopped', updatedAt: new Date().toISOString() } : test
        ));
      } else {
        throw new Error(response.message || 'Failed to stop test');
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to stop A/B test');
    }
  };

  const deleteTest = async (id: string) => {
    try {
      const response = await abTestApiService.deleteABTest(id);
      if (response.success) {
        setTests(prev => prev.filter(test => test.id !== id));
      } else {
        throw new Error(response.message || 'Failed to delete test');
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete A/B test');
    }
  };

  return {
    tests,
    loading,
    error,
    createTest,
    updateTest,
    startTest,
    stopTest,
    deleteTest
  };
}