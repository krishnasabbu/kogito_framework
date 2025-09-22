import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Play, 
  Pause, 
  CheckCircle, 
  BarChart3,
  Calendar,
  Users,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useKogitoStore } from '../../stores/kogitoStore';
import { ABTest } from '../../types/kogito';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function ABTestList() {
  const {
    abTests,
    isLoadingABTests,
    loadABTests,
    startABTest,
    pauseABTest,
    completeABTest,
    setCurrentABTest,
    setShowABTestCreator
  } = useKogitoStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadABTests();
  }, [loadABTests]);

  const filteredABTests = abTests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateABTest = () => {
    setCurrentABTest(null);
    setShowABTestCreator(true);
  };

  const handleStartTest = async (test: ABTest) => {
    try {
      await startABTest(test.id);
      toast.success(`A/B test "${test.name}" started`);
    } catch (error) {
      toast.error('Failed to start A/B test');
    }
  };

  const handlePauseTest = async (test: ABTest) => {
    try {
      await pauseABTest(test.id);
      toast.success(`A/B test "${test.name}" paused`);
    } catch (error) {
      toast.error('Failed to pause A/B test');
    }
  };

  const handleCompleteTest = async (test: ABTest) => {
    if (window.confirm(`Are you sure you want to complete "${test.name}"? This action cannot be undone.`)) {
      try {
        await completeABTest(test.id);
        toast.success(`A/B test "${test.name}" completed`);
      } catch (error) {
        toast.error('Failed to complete A/B test');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-success text-white';
      case 'draft':
        return 'bg-gray-500 text-white';
      case 'paused':
        return 'bg-warning text-white';
      case 'completed':
        return 'bg-primary text-white';
      default:
        return 'bg-gray-300 text-text-primary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play size={14} />;
      case 'paused':
        return <Pause size={14} />;
      case 'completed':
        return <CheckCircle size={14} />;
      default:
        return <AlertCircle size={14} />;
    }
  };

  const calculateWinner = (test: ABTest) => {
    const { metrics } = test;
    if (metrics.groupASuccessRate > metrics.groupBSuccessRate) {
      return 'A';
    } else if (metrics.groupBSuccessRate > metrics.groupASuccessRate) {
      return 'B';
    }
    return 'Tie';
  };

  if (isLoadingABTests) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Loading A/B tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">A/B Tests</h2>
          <p className="text-text-muted">Compare workflow performance and optimize your processes</p>
        </div>
        
        <button
          onClick={handleCreateABTest}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary-600 rounded-md transition-colors"
        >
          <Plus size={20} />
          Create A/B Test
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-surface rounded-lg">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search A/B tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="running">Running</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* A/B Tests Grid */}
      {filteredABTests.length === 0 ? (
        <div className="text-center py-12">
          <BarChart3 size={48} className="mx-auto mb-4 text-text-muted opacity-50" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No A/B tests found</h3>
          <p className="text-text-muted mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Create your first A/B test to compare workflow performance'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={handleCreateABTest}
              className="px-4 py-2 bg-primary text-white hover:bg-primary-600 rounded-md transition-colors"
            >
              Create A/B Test
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredABTests.map((test) => (
            <div
              key={test.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-wells transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    {test.name}
                  </h3>
                  <p className="text-sm text-text-muted line-clamp-2">
                    {test.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(test.status)}`}>
                    {getStatusIcon(test.status)}
                    {test.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Metrics Overview */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-surface p-3 rounded-lg">
                  <div className="text-sm text-text-muted mb-1">Total Executions</div>
                  <div className="text-xl font-bold text-text-primary">
                    {test.metrics.totalExecutions.toLocaleString()}
                  </div>
                </div>
                
                <div className="bg-surface p-3 rounded-lg">
                  <div className="text-sm text-text-muted mb-1">Traffic Split</div>
                  <div className="text-xl font-bold text-text-primary">
                    {test.trafficSplit}% / {100 - test.trafficSplit}%
                  </div>
                </div>
              </div>

              {/* A/B Comparison */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="border border-blue-200 bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800">Variant A</span>
                    {test.status === 'completed' && calculateWinner(test) === 'A' && (
                      <TrendingUp size={14} className="text-success" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-blue-600">
                      Success Rate: {(test.metrics.groupASuccessRate * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-blue-600">
                      Avg Duration: {test.metrics.groupAAvgDuration}ms
                    </div>
                    <div className="text-xs text-blue-600">
                      Executions: {test.metrics.groupAExecutions}
                    </div>
                  </div>
                </div>

                <div className="border border-green-200 bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-800">Variant B</span>
                    {test.status === 'completed' && calculateWinner(test) === 'B' && (
                      <TrendingUp size={14} className="text-success" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-green-600">
                      Success Rate: {(test.metrics.groupBSuccessRate * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-green-600">
                      Avg Duration: {test.metrics.groupBAvgDuration}ms
                    </div>
                    <div className="text-xs text-green-600">
                      Executions: {test.metrics.groupBExecutions}
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistical Significance */}
              {test.status === 'running' || test.status === 'completed' ? (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-primary">
                      Statistical Significance
                    </span>
                    <span className={`text-sm font-medium ${
                      test.metrics.statisticalSignificance >= 0.95 ? 'text-success' : 'text-warning'
                    }`}>
                      {(test.metrics.statisticalSignificance * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${
                        test.metrics.statisticalSignificance >= 0.95 ? 'bg-success' : 'bg-warning'
                      }`}
                      style={{ width: `${test.metrics.statisticalSignificance * 100}%` }}
                    />
                  </div>
                </div>
              ) : null}

              {/* Metadata */}
              <div className="space-y-2 mb-4 text-sm text-text-muted">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>Started {format(new Date(test.startDate), 'MMM d, yyyy')}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users size={14} />
                  <span>Created by {test.createdBy}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {test.status === 'draft' && (
                  <button
                    onClick={() => handleStartTest(test)}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium bg-success text-white hover:bg-green-600 rounded-md transition-colors"
                  >
                    <Play size={14} />
                    Start
                  </button>
                )}
                
                {test.status === 'running' && (
                  <>
                    <button
                      onClick={() => handlePauseTest(test)}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium bg-warning text-white hover:bg-yellow-600 rounded-md transition-colors"
                    >
                      <Pause size={14} />
                      Pause
                    </button>
                    
                    <button
                      onClick={() => handleCompleteTest(test)}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium bg-primary text-white hover:bg-primary-600 rounded-md transition-colors"
                    >
                      <CheckCircle size={14} />
                      Complete
                    </button>
                  </>
                )}
                
                {test.status === 'paused' && (
                  <>
                    <button
                      onClick={() => handleStartTest(test)}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium bg-success text-white hover:bg-green-600 rounded-md transition-colors"
                    >
                      <Play size={14} />
                      Resume
                    </button>
                    
                    <button
                      onClick={() => handleCompleteTest(test)}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium bg-primary text-white hover:bg-primary-600 rounded-md transition-colors"
                    >
                      <CheckCircle size={14} />
                      Complete
                    </button>
                  </>
                )}

                <button
                  onClick={() => setCurrentABTest(test)}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-text-primary hover:bg-gray-100 rounded-md transition-colors ml-auto"
                >
                  <BarChart3 size={14} />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}