import React, { useEffect, useState } from 'react';
import { 
  Search, 
  CheckSquare, 
  Clock, 
  User, 
  Eye,
  Calendar,
  AlertCircle,
  Play
} from 'lucide-react';
import { useKogitoStore } from '../../stores/kogitoStore';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function TaskList() {
  const {
    tasks,
    loadTasks,
    claimTask,
    completeTask,
    setCurrentTask
  } = useKogitoStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignee?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesAssignee = assigneeFilter === 'all' || 
                           (assigneeFilter === 'unassigned' && !task.assignee) ||
                           task.assignee === assigneeFilter;
    
    return matchesSearch && matchesStatus && matchesAssignee;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckSquare className="text-success" size={16} />;
      case 'in_progress':
        return <Play className="text-primary" size={16} />;
      case 'ready':
        return <Clock className="text-warning" size={16} />;
      case 'reserved':
        return <User className="text-blue-500" size={16} />;
      case 'failed':
      case 'error':
        return <AlertCircle className="text-error" size={16} />;
      default:
        return <Clock className="text-text-muted" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-white';
      case 'in_progress':
        return 'bg-primary text-white';
      case 'ready':
        return 'bg-warning text-white';
      case 'reserved':
        return 'bg-blue-500 text-white';
      case 'failed':
      case 'error':
        return 'bg-error text-white';
      default:
        return 'bg-gray-300 text-text-primary';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'text-error';
    if (priority >= 5) return 'text-warning';
    return 'text-text-muted';
  };

  const handleClaimTask = async (taskId: string) => {
    try {
      await claimTask(taskId, 'current-user'); // This should come from auth context
      toast.success('Task claimed successfully');
    } catch (error) {
      toast.error('Failed to claim task');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      // Mock output data - in real app, this would come from a form
      const outputData = {
        completed: true,
        completedBy: 'current-user',
        completedAt: new Date().toISOString()
      };
      
      await completeTask(taskId, outputData);
      toast.success('Task completed successfully');
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  const uniqueAssignees = Array.from(new Set(tasks.map(t => t.assignee).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Tasks</h2>
          <p className="text-text-muted">Manage and complete workflow tasks</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-surface rounded-lg">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search tasks..."
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
          <option value="created">Created</option>
          <option value="ready">Ready</option>
          <option value="reserved">Reserved</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>

        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">All Assignees</option>
          <option value="unassigned">Unassigned</option>
          {uniqueAssignees.map(assignee => (
            <option key={assignee} value={assignee}>
              {assignee}
            </option>
          ))}
        </select>
      </div>

      {/* Tasks Table */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <CheckSquare size={48} className="mx-auto mb-4 text-text-muted opacity-50" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No tasks found</h3>
          <p className="text-text-muted">
            {searchTerm || statusFilter !== 'all' || assigneeFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Tasks will appear here when workflows create human tasks'
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
                    Task
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-text-primary">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-text-primary">
                    Priority
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-text-primary">
                    Assignee
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-text-primary">
                    Created
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-text-primary">
                    Process
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-text-primary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-text-primary">
                        {task.name}
                      </div>
                      <div className="text-xs text-text-muted">
                        {task.id.substring(0, 8)}...
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-primary">
                        {task.assignee ? (
                          <div className="flex items-center gap-1">
                            <User size={14} />
                            {task.assignee}
                          </div>
                        ) : (
                          <span className="text-text-muted">Unassigned</span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-text-muted">
                        <Calendar size={14} />
                        {format(new Date(task.createdDate), 'MMM d, HH:mm')}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-primary">
                        {task.processInstanceId.substring(0, 8)}...
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentTask(task)}
                          className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-primary hover:bg-primary-50 rounded-md transition-colors"
                        >
                          <Eye size={14} />
                          View
                        </button>
                        
                        {!task.assignee && task.status === 'ready' && (
                          <button
                            onClick={() => handleClaimTask(task.id)}
                            className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-white bg-primary hover:bg-primary-600 rounded-md transition-colors"
                          >
                            <User size={14} />
                            Claim
                          </button>
                        )}
                        
                        {task.assignee === 'current-user' && (task.status === 'reserved' || task.status === 'in_progress') && (
                          <button
                            onClick={() => handleCompleteTask(task.id)}
                            className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-white bg-success hover:bg-green-600 rounded-md transition-colors"
                          >
                            <CheckSquare size={14} />
                            Complete
                          </button>
                        )}
                      </div>
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