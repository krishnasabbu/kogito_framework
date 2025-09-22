import React from 'react';
import { X, Settings, Code2 } from 'lucide-react';
import { useFlowStore } from '../../stores/flowStore';
import { nodeTypes } from '../../data/nodeTypes';
import MonacoEditor from '@monaco-editor/react';

export default function PropertiesPanel() {
  const { selectedNode, selectedEdge, updateNodeData, updateEdgeData, togglePropertiesPanel } = useFlowStore();
  
  if (!selectedNode && !selectedEdge) {
    return (
      <div className="w-88 bg-white border-l border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Settings size={20} />
            Properties
          </h3>
          <button
            onClick={togglePropertiesPanel}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="text-center text-text-muted py-8">
          <Settings size={48} className="mx-auto mb-4 opacity-30" />
          <p>Select a node or edge to edit its properties</p>
        </div>
      </div>
    );
  }

  const handleNodeConfigChange = (field: string, value: any) => {
    if (!selectedNode) return;
    
    updateNodeData(selectedNode.id, {
      config: {
        ...selectedNode.data.config,
        [field]: value
      }
    });
  };

  const handleEdgeConfigChange = (field: string, value: any) => {
    if (!selectedEdge) return;
    
    updateEdgeData(selectedEdge.id, {
      [field]: value
    });
  };

  const renderNodeProperties = () => {
    if (!selectedNode) return null;

    const nodeType = nodeTypes.find(nt => nt.type === selectedNode.type);
    if (!nodeType) return null;

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Label
          </label>
          <input
            type="text"
            value={selectedNode.data.label}
            onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {nodeType.configSchema.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {field.label}
              {field.required && <span className="text-error ml-1">*</span>}
            </label>

            {field.type === 'text' && (
              <input
                type="text"
                value={selectedNode.data.config[field.name] || ''}
                onChange={(e) => handleNodeConfigChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            )}

            {field.type === 'number' && (
              <input
                type="number"
                value={selectedNode.data.config[field.name] || ''}
                onChange={(e) => handleNodeConfigChange(field.name, parseInt(e.target.value))}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            )}

            {field.type === 'select' && (
              <select
                value={selectedNode.data.config[field.name] || ''}
                onChange={(e) => handleNodeConfigChange(field.name, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select...</option>
                {field.options?.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            )}

            {field.type === 'boolean' && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedNode.data.config[field.name] || false}
                  onChange={(e) => handleNodeConfigChange(field.name, e.target.checked)}
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="text-sm text-text-muted">Enable</span>
              </label>
            )}

            {field.type === 'code' && (
              <div className="border border-gray-300 rounded-md overflow-hidden">
                <MonacoEditor
                  height="150px"
                  language="javascript"
                  value={selectedNode.data.config[field.name] || ''}
                  onChange={(value) => handleNodeConfigChange(field.name, value || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 12,
                    lineNumbers: 'off',
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            )}

            {field.type === 'json' && (
              <textarea
                value={selectedNode.data.config[field.name] ? JSON.stringify(selectedNode.data.config[field.name], null, 2) : '{}'}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handleNodeConfigChange(field.name, parsed);
                  } catch (error) {
                    // Invalid JSON, don't update
                  }
                }}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
              />
            )}

            {field.description && (
              <p className="text-xs text-text-muted mt-1">{field.description}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderEdgeProperties = () => {
    if (!selectedEdge) return null;

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Condition Expression
          </label>
          <div className="border border-gray-300 rounded-md overflow-hidden">
            <MonacoEditor
              height="100px"
              language="javascript"
              value={selectedEdge.data?.condition || ''}
              onChange={(value) => handleEdgeConfigChange('condition', value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 12,
                lineNumbers: 'off',
                wordWrap: 'on',
                scrollBeyondLastLine: false,
              }}
            />
          </div>
          <p className="text-xs text-text-muted mt-1">
            JavaScript expression that determines if this edge should be taken
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-88 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          {selectedNode && <Settings size={20} />}
          {selectedEdge && <Code2 size={20} />}
          {selectedNode ? 'Node Properties' : 'Edge Properties'}
        </h3>
        <button
          onClick={togglePropertiesPanel}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {selectedNode && renderNodeProperties()}
      {selectedEdge && renderEdgeProperties()}
    </div>
  );
}