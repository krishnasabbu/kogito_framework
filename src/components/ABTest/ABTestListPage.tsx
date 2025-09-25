import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, BarChart3 } from 'lucide-react';
import { Button } from '../ui/button';
import ABTestCard from './ABTestCard';
import { useABTests } from '../../hooks/useABTests';
import { ABTestConfig } from '../../types/abtest';
import toast from 'react-hot-toast';

export default function ABTestListPage() {
  const navigate = useNavigate();
  const { tests, loading, startTest, stopTest } = useABTests();

  const handleViewTest = (test: ABTestConfig) => {
    navigate(`/kogito/ab-tests/${test.id}/dashboard`);
  };

  const handleToggleStatus = async (test: ABTestConfig) => {
    try {
      if (test.status === 'running') {
        await stopTest(test.id);
        toast.success('Test stopped successfully');
      } else {
        await startTest(test.id);
        toast.success('Test started successfully');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update test status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wells-red mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading A/B tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <div className="mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              A/B Testing Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor and analyze your workflow A/B tests
            </p>
          </div>
          
          <Button
            onClick={() => navigate('/kogito/ab-tests/new')}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            Create A/B Test
          </Button>
        </motion.div>

        {/* Tests Grid */}
        {tests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <BarChart3 size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
              No A/B tests yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first A/B test to start comparing workflow performance
            </p>
            <Button
              onClick={() => navigate('/kogito/ab-tests/new')}
              className="flex items-center gap-2"
            >
              <Plus size={20} />
              Create A/B Test
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test, index) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
              >
                <ABTestCard
                  test={test}
                  onView={handleViewTest}
                  onToggleStatus={handleToggleStatus}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}