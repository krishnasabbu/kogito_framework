import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Play, 
  CheckCircle, 
  XCircle, 
  Pause, 
  Eye,
  Calendar,
  Activity,
  StopCircle
} from 'lucide-react';
import { useKogitoStore } from '../../stores/kogitoStore';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function ProcessInstanceList() {
  const {
    processInstances,
    loadProcessInstances,
    abortProcessInstance,
    setCurrentProcessInstance
  } = useKogitoStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadProcessInstances();
  }, [loadProcessInstances]);

  const filteredInstances = processInstances.filter(instance => {
    const matchesSearch = instance.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instance.processId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instance.businessKey?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || instance.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="text-primary" size={16} />;
      case 'completed':
        return <CheckCircle className="text-success" size={16} />;
      case 'aborted':
        return <XCircle className="text-error" size={16} />;
      case 'suspended':
        return <Pause className="text-warning" size={16} />;
      default:
        return <Activity className="text-text-muted" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-primary text-white';
      case 'completed':
        return 'bg-success text-white';
      case 'aborted':
        return 'bg-error text-white';
      case 'suspended':
        return 'bg-warning text-white';
      default:
        return 'bg-gray-300 text-text-primary';
    }
  };

  const handleAbortInstance = async (instanceId: string) => {
    if (window.confirm('Are you sure you want to abort this process instance?')) {
      try {
        await abortProcessInstance(instanceId);
        toast.success('Process instance aborted');
      } catch (error) {
        toast.error('Failed to abort process instance');
      }
    }
  };

  const formatDuration = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const duration = end.getTime() - start.getTime();
    
    if (duration < 60000) {
      return `${Math.floor(duration / 1000)}s`;
    } else if (duration < 3600000) {
      return `${Math.floor(duration / 60000)}m`;
    } else {
      return `${Math.floor(duration / 3600000)}h`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Process Instances</h2>
          <p className="text-text-muted">Monitor active and completed process instances</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-surface rounded-lg">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search process instances..."
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
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="aborted">Aborted</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Process Instances Table */}
      {filteredInstances.length === 0 ? (
        <div className="text-center py-12">
          <Activity size={48} className="mx-auto mb-4 text-text-muted opacity-50" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No process instances found</h3>
          <p className="text-text-muted">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Process instances will appear here when workflows are executed'
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
                    Instance ID
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-text-primary">
                    Process ID
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-text-primary">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-text-primary">
                    Business Key
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-text-primary">
                    Duration
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-text-primary">
                    Started
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-text-primary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInstances.map((instance) => (
                  <tr key={instance.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-text-primary">
                        {instance.id.substring(0, 8)}...
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-primary">
                        {instance.processId}
                      </div>
                      <div className="text-xs text-text-muted">
                        v{instance.processVersion}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(instance.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(instance.status)}`}>
                          {instance.status.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-primary">
                        {instance.businessKey || '-'}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-primary">
                        {formatDuration(instance.startDate, instance.endDate)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-text-muted">
                        <Calendar size={14} />
                        {format(new Date(instance.startDate), 'MMM d, HH:mm')}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentProcessInstance(instance)}
                          className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-primary hover:bg-primary-50 rounded-md transition-colors"
                        >
                          <Eye size={14} />
                          View
                        </button>
                        
                        {instance.status === 'active' && (
                          <button
                            onClick={() => handleAbortInstance(instance.id)}
                            className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-error hover:bg-red-50 rounded-md transition-colors"
                          >
                            <StopCircle size={14} />
                            Abort
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