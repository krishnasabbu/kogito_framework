import { useState, useEffect } from 'react';
import { ABTestConfig } from '../types/abtest';
import { abTestService } from '../services/abTestService';

export function useABTests() {
  const [tests, setTests] = useState<ABTestConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const allTests = await abTestService.getAllTests();
        setTests(allTests);
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
      const newTest = await abTestService.createTest(testData);
      setTests(prev => [newTest, ...prev]);
      return newTest;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create A/B test');
    }
  };

  const updateTest = async (id: string, updates: Partial<ABTestConfig>) => {
    try {
      const updatedTest = await abTestService.getTest(id);
      if (updatedTest) {
        setTests(prev => prev.map(test =>
          test.id === id ? { ...test, ...updatedTest } : test
        ));
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update A/B test');
    }
  };

  const startTest = async (id: string) => {
    try {
      const updatedTest = await abTestService.startTest(id);
      setTests(prev => prev.map(test =>
        test.id === id ? updatedTest : test
      ));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to start A/B test');
    }
  };

  const stopTest = async (id: string) => {
    try {
      const updatedTest = await abTestService.stopTest(id);
      setTests(prev => prev.map(test =>
        test.id === id ? updatedTest : test
      ));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to stop A/B test');
    }
  };

  const deleteTest = async (id: string) => {
    try {
      await abTestService.deleteTest(id);
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
