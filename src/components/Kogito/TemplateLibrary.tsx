import React, { useEffect, useState } from 'react';
import { 
  Search, 
  BookOpen, 
  Download, 
  Star, 
  Eye,
  Filter,
  Plus
} from 'lucide-react';
import { useKogitoStore } from '../../stores/kogitoStore';
import { WorkflowTemplate } from '../../types/kogito';
import toast from 'react-hot-toast';

export default function TemplateLibrary() {
  const {
    templates,
    loadTemplates,
    createTemplate,
    setCurrentWorkflow,
    setShowWorkflowEditor
  } = useKogitoStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'usageCount' | 'createdAt'>('rating');

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const categories = Array.from(new Set(templates.map(t => t.category)));

  const filteredTemplates = templates
    .filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.rating - a.rating;
        case 'usageCount':
          return b.usageCount - a.usageCount;
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  const handleUseTemplate = (template: WorkflowTemplate) => {
    const newWorkflow = {
      name: `${template.name} (From Template)`,
      description: template.description,
      version: '1.0.0',
      status: 'draft' as const,
      bpmnContent: template.bpmnContent,
      dmnContent: template.dmnContent,
      tags: [...template.tags],
      variables: [...template.variables],
      createdBy: 'current-user'
    };

    setCurrentWorkflow(newWorkflow as any);
    setShowWorkflowEditor(true);
    toast.success('Template loaded for editing');
  };

  const handleCreateTemplate = () => {
    // This would typically open a form to create a new template
    toast.info('Template creation form would open here');
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Template Library</h2>
          <p className="text-text-muted">Discover and use pre-built workflow templates</p>
        </div>
        
        <button
          onClick={handleCreateTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary-600 rounded-md transition-colors"
        >
          <Plus size={20} />
          Create Template
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-surface rounded-lg">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="rating">Highest Rated</option>
          <option value="usageCount">Most Used</option>
          <option value="name">Name A-Z</option>
          <option value="createdAt">Recently Added</option>
        </select>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen size={48} className="mx-auto mb-4 text-text-muted opacity-50" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No templates found</h3>
          <p className="text-text-muted">
            {searchTerm || categoryFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Templates will appear here as they are created'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-wells transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-text-muted line-clamp-2">
                    {template.description}
                  </p>
                </div>
                
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                  {template.category}
                </span>
              </div>

              {/* Rating and Usage */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1">
                  {getRatingStars(template.rating)}
                  <span className="text-sm text-text-muted ml-1">
                    ({template.rating.toFixed(1)})
                  </span>
                </div>
                
                <div className="text-sm text-text-muted">
                  {template.usageCount} uses
                </div>
              </div>

              {/* Tags */}
              {template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-gray-100 text-text-muted rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-text-muted rounded">
                      +{template.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Metadata */}
              <div className="text-xs text-text-muted mb-4">
                <div>Created by {template.createdBy}</div>
                <div>Variables: {template.variables.length}</div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary-600 rounded-md transition-colors"
                >
                  <Download size={14} />
                  Use Template
                </button>
                
                <button
                  className="p-2 text-text-muted hover:text-text-primary hover:bg-gray-100 rounded-md transition-colors"
                  title="Preview"
                >
                  <Eye size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}