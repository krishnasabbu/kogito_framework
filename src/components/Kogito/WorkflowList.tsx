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

  useEffect(() => {
    loadWorkflows();
    console.log("workflows =========== "+JSON.stringify(workflows));
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
      <div className="flex items-center gap-4 p-4 bg-surface rounded-lg">
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
      </div>

      {/* Workflow Grid */}
      {filteredWorkflows.length === 0 ? (
        <div className="text-center py-12">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow) => (
            <div
              key={workflow.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {workflow.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {workflow.description}
                  </p>
                </div>
                
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(workflow.status)}`}>
                  {workflow.status.toUpperCase()}
                </span>
              </div>

              {/* Metadata */}
              <div className="space-y-2 mb-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <User size={14} />
                  <span>{workflow.createdBy}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>Updated {format(new Date(workflow.updatedAt), 'MMM d, yyyy')}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Tag size={14} />
                  <span>v{workflow.version}</span>
                </div>
              </div>

              {/* Tags */}
              {workflow.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {workflow.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {workflow.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                      +{workflow.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditWorkflow(workflow)}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                >
                  <Edit size={14} />
                  Edit
                </button>
                
                {workflow.status === 'active' && (
                  <button
                    onClick={() => handleExecuteWorkflow(workflow)}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg shadow-lg transition-all duration-200"
                  >
                    <Play size={14} />
                    Run
                  </button>
                )}
                
                <div className="flex items-center gap-1 ml-auto">
                  <button
                    onClick={() => handleDuplicateWorkflow(workflow)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                    title="Duplicate"
                  >
                    <Copy size={14} />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteWorkflow(workflow)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}