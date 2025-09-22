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
        return 'bg-green-600 text-white';
      case 'draft':
        return 'bg-bolt-text-disabled text-white';
      case 'paused':
        return 'bg-bolt-accent-gold text-black';
      case 'completed':
        return 'bg-bolt-accent-red text-white';
      default:
        return 'bg-bolt-text-disabled text-white';
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bolt-accent-red mx-auto mb-4"></div>
          <p className="text-bolt-text-secondary">Loading A/B tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-bolt-text-primary">A/B Tests</h2>
          <p className="text-bolt-text-secondary">Compare workflow performance and optimize your processes</p>
        </div>
        
        <button
          onClick={handleCreateABTest}
          className="btn-primary flex items-center gap-2 px-6 py-3"
        >
          <Plus size={20} />
          Create A/B Test
        </button>
      </div>

      {/* Filters */}
      <div className="card flex items-center gap-4 p-6">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bolt-text-secondary" />
          <input
            type="text"
            placeholder="Search A/B tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-bolt-bg-surface-alt border border-bolt-divider text-bolt-text-default rounded-lg focus:ring-2 focus:ring-bolt-accent-red focus:border-transparent transition-all duration-200"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-bolt-bg-surface-alt border border-bolt-divider text-bolt-text-default rounded-lg focus:ring-2 focus:ring-bolt-accent-red focus:border-transparent"
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
            className={`p-3 rounded-lg transition-all duration-200 ${
              viewMode === 'card'
                ? 'bg-bolt-accent-red text-white shadow-bolt'
                : 'text-bolt-text-secondary hover:text-bolt-text-primary hover:bg-bolt-hover'
            }`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-3 rounded-lg transition-all duration-200 ${
              viewMode === 'table'
                ? 'bg-bolt-accent-red text-white shadow-bolt'
                : 'text-bolt-text-secondary hover:text-bolt-text-primary hover:bg-bolt-hover'
            }`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* A/B Tests Display */}
      {filteredABTests.length === 0 ? (
        <div className="text-center py-16">
          <BarChart3 size={64} className="mx-auto mb-4 text-bolt-text-disabled opacity-50" />
          <h3 className="text-xl font-medium text-bolt-text-primary mb-2">No A/B tests found</h3>
          <p className="text-bolt-text-secondary mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Create your first A/B test to compare workflow performance'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={handleCreateABTest}
              className="btn-primary"
            >
              Create A/B Test
            </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredABTests.map((test) => (
                <div
                  key={test.id}
                  className="card-hover p-6 h-96 flex flex-col"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-bolt-text-primary mb-2 truncate">
                        {test.name}
                      </h3>
                      <p className="text-sm text-bolt-text-secondary line-clamp-2">
                        {test.description}
                      </p>
                    </div>
                    
                    <span className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(test.status)}`}>
                      {getStatusIcon(test.status)}
                      {test.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Metrics Overview */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-bolt-bg-surface-alt p-3 rounded-lg border border-bolt-divider">
                      <div className="text-xs text-bolt-text-secondary mb-1">Total Executions</div>
                      <div className="text-lg font-bold text-bolt-accent-gold">
                        {test.metrics.totalExecutions.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="bg-bolt-bg-surface-alt p-3 rounded-lg border border-bolt-divider">
                      <div className="text-xs text-bolt-text-secondary mb-1">Traffic Split</div>
                      <div className="text-lg font-bold text-bolt-text-primary">
                        {test.trafficSplit}% / {100 - test.trafficSplit}%
                      </div>
                    </div>
                  </div>

                  {/* A/B Comparison */}
                  <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
                    <div className="border border-blue-600/30 bg-blue-600/10 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-blue-400">Variant A</span>
                        {test.status === 'completed' && calculateWinner(test) === 'A' && (
                          <TrendingUp size={14} className="text-bolt-accent-gold" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-blue-300">
                          Success: {(test.metrics.groupASuccessRate * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-blue-300">
                          Duration: {test.metrics.groupAAvgDuration}ms
                        </div>
                      </div>
                    </div>

                    <div className="border border-green-600/30 bg-green-600/10 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-green-400">Variant B</span>
                        {test.status === 'completed' && calculateWinner(test) === 'B' && (
                          <TrendingUp size={14} className="text-bolt-accent-gold" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-green-300">
                          Success: {(test.metrics.groupBSuccessRate * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-green-300">
                          Duration: {test.metrics.groupBAvgDuration}ms
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1 mb-4 text-xs text-bolt-text-secondary">
                    <div className="flex items-center gap-2">
                      <Calendar size={12} />
                      <span>Started {format(new Date(test.startDate), 'MMM d, yyyy')}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users size={12} />
                      <span className="truncate">{test.createdBy}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-auto">
                    {test.status === 'draft' && (
                      <button
                        onClick={() => handleStartTest(test)}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium bg-green-600 text-white hover:bg-green-700 rounded-lg transition-all duration-200 hover:scale-105"
                      >
                        <Play size={14} />
                        Start
                      </button>
                    )}
                    
                    {test.status === 'running' && (
                      <button
                        onClick={() => handlePauseTest(test)}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium bg-bolt-accent-gold text-black hover:bg-yellow-500 rounded-lg transition-all duration-200 hover:scale-105"
                      >
                        <Pause size={14} />
                        Pause
                      </button>
                    )}
                    
                    <button
                      onClick={() => setCurrentABTest(test)}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-bolt-text-secondary hover:bg-bolt-hover rounded-lg transition-all duration-200 hover:scale-105 ml-auto"
                    >
                      <BarChart3 size={14} />
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="table">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="table-header">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-medium text-bolt-text-primary">
                        Name
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-bolt-text-primary">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-bolt-text-primary">
                        Traffic Split
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-bolt-text-primary">
                        Total Executions
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-bolt-text-primary">
                        Success Rate A/B
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-bolt-text-primary">
                        Created By
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-bolt-text-primary">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bolt-divider">
                    {filteredABTests.map((test) => (
                      <tr key={test.id} className="table-row">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-bolt-text-primary">
                              {test.name}
                            </div>
                            <div className="text-sm text-bolt-text-secondary truncate max-w-xs">
                              {test.description}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(test.status)}`}>
                            {getStatusIcon(test.status)}
                            {test.status.toUpperCase()}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm text-bolt-text-primary">
                            {test.trafficSplit}% / {100 - test.trafficSplit}%
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm text-bolt-accent-gold font-semibold">
                            {test.metrics.totalExecutions.toLocaleString()}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm text-bolt-text-primary">
                            {(test.metrics.groupASuccessRate * 100).toFixed(1)}% / {(test.metrics.groupBSuccessRate * 100).toFixed(1)}%
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm text-bolt-text-primary">
                            {test.createdBy}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {test.status === 'draft' && (
                              <button
                                onClick={() => handleStartTest(test)}
                                className="p-2 text-green-400 hover:bg-green-600/20 rounded-lg transition-all duration-200 hover:scale-110"
                                title="Start"
                              >
                                <Play size={16} />
                              </button>
                            )}
                            
                            {test.status === 'running' && (
                              <button
                                onClick={() => handlePauseTest(test)}
                                className="p-2 text-bolt-accent-gold hover:bg-yellow-600/20 rounded-lg transition-all duration-200 hover:scale-110"
                                title="Pause"
                              >
                                <Pause size={16} />
                              </button>
                            )}
                            
                            <button
                              onClick={() => setCurrentABTest(test)}
                              className="p-2 text-bolt-accent-red hover:bg-bolt-accent-red/20 rounded-lg transition-all duration-200 hover:scale-110"
                              title="View Details"
                            >
                              <BarChart3 size={16} />
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
        </>
      )}
    </div>
  );
}