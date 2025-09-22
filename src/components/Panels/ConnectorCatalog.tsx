import React, { useState } from 'react';
import { X, Plus, Search, Link, Edit, Trash2 } from 'lucide-react';
import { useFlowStore } from '../../stores/flowStore';
import { Connector } from '../../types/flow';
import { v4 as uuidv4 } from 'uuid';

export default function ConnectorCatalog() {
  const { connectors, addConnector, updateConnector, deleteConnector, toggleConnectorCatalog } = useFlowStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingConnector, setEditingConnector] = useState<string | null>(null);

  const filteredConnectors = connectors.filter(connector =>
    connector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connector.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddConnector = () => {
    const newConnector: Connector = {
      id: uuidv4(),
      name: 'New Connector',
      description: 'A new API connector',
      baseUrl: 'https://api.example.com',
      authType: 'none',
      authConfig: {},
      endpoints: []
    };
    
    addConnector(newConnector);
    setEditingConnector(newConnector.id);
    setShowAddForm(false);
  };

  const handleSaveConnector = (id: string, data: Partial<Connector>) => {
    updateConnector(id, data);
    setEditingConnector(null);
  };

  return (
    <div className="fixed left-0 top-0 h-full w-96 bg-white border-r border-gray-200 shadow-wells-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <Link size={20} />
          Connector Catalog
        </h3>
        <button
          onClick={toggleConnectorCatalog}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Search & Add */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search connectors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <button
          onClick={handleAddConnector}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary-600 rounded-md transition-colors"
        >
          <Plus size={16} />
          Add Connector
        </button>
      </div>

      {/* Connector List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredConnectors.length === 0 ? (
          <div className="text-center text-text-muted py-8">
            <Link size={48} className="mx-auto mb-4 opacity-30" />
            <p>No connectors found</p>
            <p className="text-sm mt-2">Add your first connector to get started</p>
          </div>
        ) : (
          filteredConnectors.map((connector) => (
            <ConnectorCard
              key={connector.id}
              connector={connector}
              isEditing={editingConnector === connector.id}
              onEdit={() => setEditingConnector(connector.id)}
              onSave={(data) => handleSaveConnector(connector.id, data)}
              onCancel={() => setEditingConnector(null)}
              onDelete={() => deleteConnector(connector.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface ConnectorCardProps {
  connector: Connector;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (data: Partial<Connector>) => void;
  onCancel: () => void;
  onDelete: () => void;
}

function ConnectorCard({ connector, isEditing, onEdit, onSave, onCancel, onDelete }: ConnectorCardProps) {
  const [formData, setFormData] = useState({
    name: connector.name,
    description: connector.description,
    baseUrl: connector.baseUrl,
    authType: connector.authType
  });

  const handleSave = () => {
    onSave(formData);
  };

  const authTypeLabels = {
    none: 'No Authentication',
    apikey: 'API Key',
    basic: 'Basic Auth',
    oauth2: 'OAuth 2.0'
  };

  if (isEditing) {
    return (
      <div className="bg-surface border border-gray-200 rounded-lg p-4">
        <div className="space-y-3">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Connector Name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />

          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Description"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />

          <input
            type="url"
            value={formData.baseUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
            placeholder="Base URL"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />

          <select
            value={formData.authType}
            onChange={(e) => setFormData(prev => ({ ...prev, authType: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="none">No Authentication</option>
            <option value="apikey">API Key</option>
            <option value="basic">Basic Auth</option>
            <option value="oauth2">OAuth 2.0</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 px-3 py-2 bg-primary text-white hover:bg-primary-600 rounded-md transition-colors text-sm"
            >
              Save
            </button>
            <button
              onClick={onCancel}
              className="flex-1 px-3 py-2 bg-gray-100 text-text-primary hover:bg-gray-200 rounded-md transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-gray-200 rounded-lg p-4 hover:shadow-wells transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-text-primary">{connector.name}</h4>
          <p className="text-sm text-text-muted mt-1">{connector.description}</p>
        </div>
        
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 hover:bg-red-100 text-error rounded-md transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-text-muted">Base URL:</span>
          <span className="text-text-primary font-mono text-xs truncate ml-2">
            {connector.baseUrl}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-text-muted">Auth Type:</span>
          <span className="text-text-primary">
            {authTypeLabels[connector.authType]}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-text-muted">Endpoints:</span>
          <span className="text-text-primary">
            {connector.endpoints.length}
          </span>
        </div>
      </div>
    </div>
  );
}