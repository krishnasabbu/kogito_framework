import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Calendar,
  Timer,
  Activity
} from 'lucide-react';
import { useKogitoStore } from '../../stores/kogitoStore';
import { WorkflowExecution } from '../../types/kogito';
import { format } from 'date-fns';

export default function ExecutionList() {
  const {
    executions,
    workflows,
    loadExecutions,
    loadWorkflows,
    setCurrentExecution
  } = useKogitoStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [workflowFilter, setWorkflowFilter] = useState<string>('all');

  useEffect(() => {
    loadExecutions();
    loadWorkflows();
  }, [loadExecutions, loadWorkflows]);

  const filteredExecutions = executions.filter(execution => {
    const workflow = workflows.find(w => w.id === execution.workflowId);
    const workflowName = workflow?.name || '';
    
    const matchesSearch = execution.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflowName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || execution.status === statusFilter;
    const matchesWorkflow = workflowFilter === 'all' || execution.workflowId === workflowFilter;
    
    return matchesSearch && matchesStatus && matchesWorkflow;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-success" size={16} />;
      case 'failed':
        return <XCircle className="text-error" size={16} />;
      case 'running':
        return <Play className="text-primary" size={16} />;
      case 'cancelled':
        return <XCircle className="text-warning" size={16} />;
      default:
        return <Clock className="text-text-muted" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-white';
      case 'failed':
        return 'bg-error text-white';
      case 'running':
        return 'bg-primary text-white';
      case 'cancelled':
        return 'bg-warning text-white';
      default:
        return 'bg-gray-300 text-text-primary';
    }
  };

  const getWorkflowName = (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    return workflow ? workflow.name : 'Unknown Workflow';
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A';
    
    if (duration < 1000) {
      return `${duration}ms`;
    } else if (duration < 60000) {
      return `${(duration / 1000).toFixed(1)}s`;
    } else {
      return `${(duration / 60000).toFixed(1)}m`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Workflow Executions</h2>
          <p className="text-text-muted">Monitor and analyze workflow execution history</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-surface rounded-lg">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search executions..."
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
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={workflowFilter}
          onChange={(e) => setWorkflowFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">All Workflows</option>
          {workflows.map(workflow => (
            <option key={workflow.id} value={workflow.id}>
              {workflow.name}
            </option>
          ))}
        </select>
      </div>

      {/* Executions Table */}
      {filteredExecutions.length === 0 ? (
        <div className="text-center py-12">
          <Activity size={48} className="mx-auto mb-4 text-text-muted opacity-50" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No executions found</h3>
          <p className="text-text-muted">
            {searchTerm || statusFilter !== 'all' || workflowFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Execute a workflow to see results here'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-text-primary">
                    Execution ID
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-text-primary">
                    Workflow
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-text-primary">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-text-primary">
                    Duration
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-text-primary">
                    Started
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-text-primary">
                    A/B Test
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-text-primary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredExecutions.map((execution) => (
                  <tr key={execution.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-text-primary">
                        {execution.id.substring(0, 8)}...
                      </div>
                      <div className="text-xs text-text-muted">
                        v{execution.workflowVersion}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-primary">
                        {getWorkflowName(execution.workflowId)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(execution.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(execution.status)}`}>
                          {execution.status.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-text-primary">
                        <Timer size={14} />
                        {formatDuration(execution.duration)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-text-muted">
                        <Calendar size={14} />
                        {format(new Date(execution.startTime), 'MMM d, HH:mm')}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      {execution.abTestId ? (
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          execution.abTestGroup === 'A' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          Group {execution.abTestGroup}
                        </span>
                      ) : (
                        <span className="text-xs text-text-muted">-</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setCurrentExecution(execution)}
                        className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-primary hover:bg-primary-50 rounded-md transition-colors"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}