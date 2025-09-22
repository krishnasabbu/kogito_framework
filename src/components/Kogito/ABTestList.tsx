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
  AlertCircle,
  Grid,
  List
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
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

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
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
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
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 rounded-lg transition-all duration-200 ${
              viewMode === 'card'
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-all duration-200 ${
              viewMode === 'table'
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* A/B Tests Grid */}
      {filteredABTests.length === 0 ? (
        <div className="text-center py-16">
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
        viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
              {filteredABTests.map((test) => (
                <div
                  key={test.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg hover:scale-105 transition-all duration-300 flex flex-col h-80"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 truncate">
                        {test.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {test.description}
                      </p>
                    </div>
                    
                    <span className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(test.status)}`}>
                      {getStatusIcon(test.status)}
                      {test.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Metrics Overview */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Executions</div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {test.metrics.totalExecutions.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Traffic Split</div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {test.trafficSplit}% / {100 - test.trafficSplit}%
                      </div>
                    </div>
                  </div>

                  {/* A/B Comparison */}
                  <div className="grid grid-cols-2 gap-2 mb-3 flex-1">
                    <div className="border border-blue-200 bg-blue-50 p-2 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-blue-800">Variant A</span>
                        {test.status === 'completed' && calculateWinner(test) === 'A' && (
                          <TrendingUp size={12} className="text-success" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-blue-600">
                          Success: {(test.metrics.groupASuccessRate * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-blue-600">
                          Duration: {test.metrics.groupAAvgDuration}ms
                        </div>
                      </div>
                    </div>

                    <div className="border border-green-200 bg-green-50 p-2 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-green-800">Variant B</span>
                        {test.status === 'completed' && calculateWinner(test) === 'B' && (
                          <TrendingUp size={12} className="text-success" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-green-600">
                          Success: {(test.metrics.groupBSuccessRate * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-green-600">
                          Duration: {test.metrics.groupBAvgDuration}ms
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1 mb-3 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar size={10} />
                      <span>Started {format(new Date(test.startDate), 'MMM d')}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Users size={10} />
                      <span className="truncate">{test.createdBy}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 mt-auto">
                    {test.status === 'draft' && (
                      <button
                        onClick={() => handleStartTest(test)}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-success text-white hover:bg-green-600 rounded transition-all duration-200"
                      >
                        <Play size={10} />
                        Start
                      </button>
                    )}
                    
                    {test.status === 'running' && (
                      <button
                        onClick={() => handlePauseTest(test)}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-warning text-white hover:bg-yellow-600 rounded transition-all duration-200"
                      >
                        <Pause size={10} />
                        Pause
                      </button>
                    )}
                    
                    <button
                      onClick={() => setCurrentABTest(test)}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all duration-200 ml-auto"
                    >
                      <BarChart3 size={10} />
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        Name
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        Status
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        Traffic Split
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        Total Executions
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        Success Rate A/B
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        Created By
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {filteredABTests.map((test) => (
                      <tr key={test.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {test.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {test.description}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(test.status)}`}>
                            {getStatusIcon(test.status)}
                            {test.status.toUpperCase()}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {test.trafficSplit}% / {100 - test.trafficSplit}%
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {test.metrics.totalExecutions.toLocaleString()}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {(test.metrics.groupASuccessRate * 100).toFixed(1)}% / {(test.metrics.groupBSuccessRate * 100).toFixed(1)}%
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {test.createdBy}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {test.status === 'draft' && (
                              <button
                                onClick={() => handleStartTest(test)}
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200"
                                title="Start"
                              >
                                <Play size={14} />
                              </button>
                            )}
                            
                            {test.status === 'running' && (
                              <button
                                onClick={() => handlePauseTest(test)}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all duration-200"
                                title="Pause"
                              >
                                <Pause size={14} />
                              </button>
                            )}
                            
                            <button
                              onClick={() => setCurrentABTest(test)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                              title="View Details"
                            >
                              <BarChart3 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      )}
    </div>
  );
}