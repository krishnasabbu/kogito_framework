import { useState, useEffect } from 'react';
import { ABTestConfig } from '../types/abtest';
import { abTestApiService, ABTestResponse } from '../services/abTestApiService';

function mapBackendToFrontend(backendTest: ABTestResponse): ABTestConfig {
  return {
    id: backendTest.id,
    name: backendTest.name,
    description: backendTest.description,
    springProjectPath: '/project',
    workflowId: backendTest.workflowId,
    arms: backendTest.arms.map((arm, index) => ({
      armKey: index === 0 ? 'a' : 'b',
      armName: arm.name,
      bpmnFile: arm.bpmnFilePath,
      processDefinitionKey: arm.id,
      customLabel: arm.description,
      trafficPercentage: arm.trafficPercentage,
      isControl: arm.isControl,
    })),
    trafficSplit: backendTest.trafficSplit,
    status: backendTest.status.toLowerCase(),
    generateListener: false,
    createdAt: backendTest.createdAt,
    updatedAt: backendTest.createdAt,
  };
}

export function useABTests() {
  const [tests, setTests] = useState<ABTestConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const response = await abTestApiService.getAllABTests();
        const mappedTests = response.map(mapBackendToFrontend);
        setTests(mappedTests);
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
        description: testData.description || '',
        workflowId: testData.workflowId || testData.name.toLowerCase().replace(/\s+/g, '-'),
        trafficSplit: testData.trafficSplit,
        hypothesis: 'Testing workflow performance',
        successMetric: 'execution_time',
        minimumSampleSize: 100,
        confidenceLevel: 0.95,
        arms: testData.arms.map(arm => ({
          name: arm.armName,
          description: arm.customLabel || arm.armName,
          bpmnFilePath: arm.bpmnFile,
          trafficPercentage: arm.trafficPercentage || 50,
          isControl: arm.isControl || false,
        })),
      };

      const response = await abTestApiService.createABTest(createRequest);
      const newTest = mapBackendToFrontend(response);
      setTests(prev => [...prev, newTest]);
      return newTest;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create A/B test');
    }
  };

  const updateTest = async (id: string, updates: Partial<ABTestConfig>) => {
    try {
      const response = await abTestApiService.getABTest(id);
      const updatedTest = mapBackendToFrontend(response);
      setTests(prev => prev.map(test =>
        test.id === id ? { ...test, ...updatedTest } : test
      ));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update A/B test');
    }
  };

  const startTest = async (id: string) => {
    try {
      const response = await abTestApiService.startABTest(id);
      const updatedTest = mapBackendToFrontend(response);
      setTests(prev => prev.map(test =>
        test.id === id ? updatedTest : test
      ));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to start A/B test');
    }
  };

  const stopTest = async (id: string) => {
    try {
      const response = await abTestApiService.stopABTest(id);
      const updatedTest = mapBackendToFrontend(response);
      setTests(prev => prev.map(test =>
        test.id === id ? updatedTest : test
      ));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to stop A/B test');
    }
  };

  const deleteTest = async (id: string) => {
    try {
      setTests(prev => prev.filter(test => test.id !== id));
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
