import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Grid, 
  List, 
  Play, 
  Edit, 
  Trash2, 
  Clock,
  CheckCircle,
  XCircle,
  Tag,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useServicesStore } from '../../stores/servicesStore';
import { Service } from '../../types/services';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function ServicesDashboard() {
  const navigate = useNavigate();
  const {
    services,
    isLoading,
    viewMode,
    searchTerm,
    pagination,
    loadServices,
    deleteService,
    executeService,
    setViewMode,
    setSearchTerm,
    setPagination
  } = useServicesStore();

  useEffect(() => {
    loadServices();
  }, [loadServices, searchTerm, pagination.page]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPagination({ page: 1 });
  };

  const handlePageChange = (page: number) => {
    setPagination({ page });
  };

  const handleEditService = (service: Service) => {
    navigate(`/services/${service.id}/edit`);
  };

  const handleDeleteService = async (service: Service) => {
    if (window.confirm(`Are you sure you want to delete "${service.name}"?`)) {
      try {
        await deleteService(service.id);
        toast.success('Service deleted successfully');
      } catch (error) {
        toast.error('Failed to delete service');
      }
    }
  };

  const handleExecuteService = async (service: Service) => {
    try {
      await executeService(service);
      toast.success('Service executed successfully');
    } catch (error) {
      toast.error('Failed to execute service');
    }
  };

  const getStatusColor = (status?: number) => {
    if (!status) return 'text-gray-400';
    if (status >= 200 && status < 300) return 'text-green-500';
    if (status >= 400) return 'text-red-500';
    return 'text-yellow-500';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800';
      case 'POST': return 'bg-green-100 text-green-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'PATCH': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">Services</h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">Manage and test your API services</p>
        </div>
        
        <button
          onClick={() => navigate('/services/new')}
          className="btn-primary flex items-center gap-2 px-6 py-3"
        >
          <Plus size={20} />
          Add Service
        </button>
      </div>

      {/* Search and View Controls */}
      <div className="card flex items-center gap-4 p-6">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-light-surface dark:bg-dark-surface-alt border border-light-border dark:border-dark-border text-light-text-primary dark:text-dark-text-default rounded-lg focus:ring-2 focus:ring-wells-red focus:border-transparent transition-all duration-200"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('card')}
            className={`p-3 rounded-lg transition-all duration-200 ${
              viewMode === 'card'
                ? 'bg-wells-red text-white shadow-card'
                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-hover dark:hover:bg-dark-hover'
            }`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-3 rounded-lg transition-all duration-200 ${
              viewMode === 'table'
                ? 'bg-wells-red text-white shadow-card'
                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-hover dark:hover:bg-dark-hover'
            }`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Services Display */}
      {services.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-light-surface dark:bg-dark-surface-alt rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus size={32} className="text-light-text-secondary dark:text-dark-text-secondary" />
          </div>
          <h3 className="text-xl font-medium text-light-text-primary dark:text-dark-text-primary mb-2">No services found</h3>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first service to get started'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate('/services/new')}
              className="btn-primary"
            >
              Add Service
            </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="card-hover p-6 h-80 flex flex-col"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-2 truncate">
                        {service.name}
                      </h3>
                      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary line-clamp-2">
                        {service.description}
                      </p>
                    </div>
                    
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getMethodColor(service.method)}`}>
                      {service.method}
                    </span>
                  </div>

                  {/* URL */}
                  <div className="mb-4">
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary truncate font-mono">
                      {service.url}
                    </p>
                  </div>

                  {/* Status */}
                  {service.response && (
                    <div className="flex items-center gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-1">
                        {service.response.status >= 200 && service.response.status < 300 ? (
                          <CheckCircle size={14} className="text-green-400" />
                        ) : (
                          <XCircle size={14} className="text-wells-red" />
                        )}
                        <span className={getStatusColor(service.response.status)}>
                          {service.response.status} {service.response.statusText}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-light-text-secondary dark:text-dark-text-secondary">
                        <Clock size={14} />
                        <span>{service.response.responseTime}ms</span>
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {service.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {service.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-light-surface dark:bg-dark-surface-alt text-light-text-secondary dark:text-dark-text-secondary rounded-full border border-light-border dark:border-dark-border"
                        >
                          {tag}
                        </span>
                      ))}
                      {service.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-light-surface dark:bg-dark-surface-alt text-light-text-secondary dark:text-dark-text-secondary rounded-full border border-light-border dark:border-dark-border">
                          +{service.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-4 flex-1">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>Updated {format(new Date(service.updatedAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-auto">
                    <button
                      onClick={() => handleExecuteService(service)}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      <Play size={14} />
                      Test
                    </button>
                    
                    <button
                      onClick={() => handleEditService(service)}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-hover dark:hover:bg-dark-hover rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    
                    <button
                      onClick={() => handleDeleteService(service)}
                      className="p-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-wells-red hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                      title="Delete"
                    >
                      <Trash2 size={14} />
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
                      <th className="text-left px-6 py-4 text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                        Name
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                        Method
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                        URL
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                        Updated
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-light-border dark:divide-dark-border">
                    {services.map((service) => (
                      <tr key={service.id} className="table-row">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                              {service.name}
                            </div>
                            <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary truncate max-w-xs">
                              {service.description}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getMethodColor(service.method)}`}>
                            {service.method}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm text-light-text-primary dark:text-dark-text-primary font-mono truncate max-w-xs">
                            {service.url}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          {service.response ? (
                            <div className="flex items-center gap-2">
                              {service.response.status >= 200 && service.response.status < 300 ? (
                                <CheckCircle size={14} className="text-green-400" />
                              ) : (
                                <XCircle size={14} className="text-wells-red" />
                              )}
                              <span className={`text-sm ${getStatusColor(service.response.status)}`}>
                                {service.response.status}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary opacity-50">Not tested</span>
                          )}
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                            {format(new Date(service.updatedAt), 'MMM d, yyyy')}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleExecuteService(service)}
                              className="p-2 text-green-400 hover:bg-green-600/20 rounded-lg transition-all duration-200 hover:scale-110"
                              title="Test"
                            >
                              <Play size={16} />
                            </button>
                            
                            <button
                              onClick={() => handleEditService(service)}
                              className="p-2 text-blue-400 hover:bg-blue-600/20 rounded-lg transition-all duration-200 hover:scale-110"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteService(service)}
                              className="p-2 text-wells-red hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                              title="Delete"
                            >
                              <Trash2 size={16} />
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="card flex items-center justify-between mt-6 p-4">
              <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} services
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                 className="p-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 hover:scale-110"
                >
                  <ChevronLeft size={20} />
                </button>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 hover:scale-105 ${
                      page === pagination.page
                        ? 'bg-wells-red text-white shadow-card'
                        : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-hover dark:hover:bg-dark-hover'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                 className="p-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 hover:scale-110"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}