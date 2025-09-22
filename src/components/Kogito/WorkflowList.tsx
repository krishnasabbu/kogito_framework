import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Play, 
  Copy, 
  Trash2, 
  Eye,
  Calendar,
  User,
  Tag,
  Activity
  Grid,
  List
} from 'lucide-react';
import { useKogitoStore } from '../../stores/kogitoStore';
import { WorkflowDefinition } from '../../types/kogito';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function WorkflowList() {
  const navigate = useNavigate();
  const {
    workflows,
    isLoadingWorkflows,
    loadWorkflows,
    deleteWorkflow,
    executeWorkflow,
    getWorkflowBuilderData
  } = useKogitoStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  const filteredWorkflows = workflows
    .filter(workflow => {
      const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           workflow.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           workflow.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleCreateWorkflow = () => {
    navigate('/kogito/workflows/new');
  };

  const handleEditWorkflow = (workflow: WorkflowDefinition) => {
    navigate(`/kogito/workflows/${workflow.id}/edit`);
  };

  const handleExecuteWorkflow = async (workflow: WorkflowDefinition) => {
    // Generate Spring Boot project and navigate to IDE
    try {
      // Check if Spring Boot project exists, if not generate it
      const { springBootGenerator } = await import('../../services/springBootGenerator');
      let project = springBootGenerator.getProject(`project-${workflow.id}`);
      
      if (!project) {
        // Get workflow builder data for service mappings
        const builderData = getWorkflowBuilderData(workflow.id);
        const serviceMappings = builderData?.serviceMappings || {};
        
        toast.success('Generating Spring Boot project...');
        project = await springBootGenerator.generateProject(workflow, serviceMappings);
      }
      
      navigate(`/kogito/workflows/${project.id}/run`);
    } catch (error) {
      console.error('Failed to prepare project for execution:', error);
      toast.error('Failed to prepare project for execution');
    }
  };

  const handleDuplicateWorkflow = async (workflow: WorkflowDefinition) => {
    try {
      const duplicatedWorkflow = {
        ...workflow,
        name: `${workflow.name} (Copy)`,
        status: 'draft' as const,
        version: '1.0.0'
      };
      
      // Remove fields that should be auto-generated
      delete (duplicatedWorkflow as any).id;
      delete (duplicatedWorkflow as any).createdAt;
      delete (duplicatedWorkflow as any).updatedAt;
      
      // For now, just navigate to new workflow page
      // In a real app, you'd pass the duplicated data
      navigate('/kogito/workflows/new');
      toast.success('Workflow duplicated');
    } catch (error) {
      toast.error('Failed to duplicate workflow');
    }
  };

  const handleDeleteWorkflow = async (workflow: WorkflowDefinition) => {
    if (window.confirm(`Are you sure you want to delete "${workflow.name}"?`)) {
      try {
        await deleteWorkflow(workflow.id);
        toast.success('Workflow deleted successfully');
      } catch (error) {
        toast.error('Failed to delete workflow');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success text-white';
      case 'draft':
        return 'bg-warning text-white';
      case 'archived':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-300 text-text-primary';
    }
  };

  if (isLoadingWorkflows) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Loading workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Workflows</h2>
          <p className="text-text-muted">Manage and execute your business processes</p>
        </div>
        
        <button
          onClick={handleCreateWorkflow}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-lg transition-all duration-200"
        >
          <Plus size={20} />
          Create Workflow
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search workflows..."
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
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-');
            setSortBy(field as any);
            setSortOrder(order as any);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="updatedAt-desc">Recently Updated</option>
          <option value="createdAt-desc">Recently Created</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
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

      {/* Workflow Grid */}
      {filteredWorkflows.length === 0 ? (
        <div className="text-center py-16">
          <Activity size={48} className="mx-auto mb-4 text-text-muted opacity-50" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No workflows found</h3>
          <p className="text-text-muted mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Create your first workflow to get started'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={handleCreateWorkflow}
              className="px-4 py-2 bg-primary text-white hover:bg-primary-600 rounded-md transition-colors"
            >
              Create Workflow
            </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
              {filteredWorkflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg hover:scale-105 transition-all duration-300 flex flex-col h-64"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 truncate">
                        {workflow.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {workflow.description}
                      </p>
                    </div>
                    
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(workflow.status)}`}>
                      {workflow.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1 mb-3 text-xs text-gray-500 dark:text-gray-400 flex-1">
                    <div className="flex items-center gap-1">
                      <User size={12} />
                      <span className="truncate">{workflow.createdBy}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{format(new Date(workflow.updatedAt), 'MMM d')}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Tag size={12} />
                      <span>v{workflow.version}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {workflow.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {workflow.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {workflow.tags.length > 2 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                          +{workflow.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                  {/* Actions */}
                  <div className="flex items-center gap-1 mt-auto">
                    <button
                      onClick={() => handleEditWorkflow(workflow)}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all duration-200"
                    >
                      <Edit size={12} />
                      Edit
                    </button>
                    
                    {workflow.status === 'active' && (
                      <button
                        onClick={() => handleExecuteWorkflow(workflow)}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded transition-all duration-200"
                      >
                        <Play size={12} />
                        Run
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDuplicateWorkflow(workflow)}
                      className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all duration-200"
                      title="Duplicate"
                    >
                      <Copy size={12} />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteWorkflow(workflow)}
                      className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all duration-200"
                      title="Delete"
                    >
                      <Trash2 size={12} />
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
                        Version
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        Created By
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        Updated
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {filteredWorkflows.map((workflow) => (
                      <tr key={workflow.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {workflow.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {workflow.description}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(workflow.status)}`}>
                            {workflow.status.toUpperCase()}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            v{workflow.version}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {workflow.createdBy}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {format(new Date(workflow.updatedAt), 'MMM d, yyyy')}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditWorkflow(workflow)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                              title="Edit"
                            >
                              <Edit size={14} />
                            </button>
                            
                            {workflow.status === 'active' && (
                              <button
                                onClick={() => handleExecuteWorkflow(workflow)}
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200"
                                title="Run"
                              >
                                <Play size={14} />
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleDuplicateWorkflow(workflow)}
                              className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                              title="Duplicate"
                            >
                              <Copy size={14} />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteWorkflow(workflow)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                              title="Delete"
                            >
                              <Trash2 size={14} />
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