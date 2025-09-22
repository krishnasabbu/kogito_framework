import React from 'react';
import { Handle, Position, NodeProps } from 'react-flow-renderer';
import { useFlowStore } from '../../stores/flowStore';
import { 
  Globe, 
  Zap, 
  Link, 
  Server, 
  GitBranch, 
  Database, 
  AlertTriangle,
  Shield,
  Package,
  Settings
} from 'lucide-react';

const iconMap = {
  'Globe': Globe,
  'Zap': Zap,
  'Link': Link,
  'Server': Server,
  'GitBranch': GitBranch,
  'Database': Database,
  'AlertTriangle': AlertTriangle,
  'Shield': Shield,
  'Package': Package,
};

export default function CustomNode({ data, selected }: NodeProps) {
  const { selectNode, toggleRestServiceConfig } = useFlowStore();
  const IconComponent = iconMap[data.icon as keyof typeof iconMap] || Zap;

  const handleRestServiceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Find the node and select it
    const nodeElement = (e.target as HTMLElement).closest('[data-id]');
    if (nodeElement) {
      const nodeId = nodeElement.getAttribute('data-id');
      // This would need to be passed from the parent component
      // For now, we'll use the current approach
      toggleRestServiceConfig();
    }
  };

  return (
    <div 
      className={`
        relative bg-white rounded-lg border-2 shadow-wells min-w-[160px] max-w-[200px]
        transition-all duration-200 hover:shadow-wells-lg
        ${selected ? 'border-primary' : 'border-gray-200'}
      `}
    >
      {/* Input Handle */}
      {data.inputs && data.inputs.length > 0 && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 !bg-primary !border-2 !border-white"
          style={{ top: '50%', left: '-6px' }}
        />
      )}

      {/* Node Content */}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-shrink-0 w-6 h-6 text-primary">
            <IconComponent size={20} />
          </div>
          <span className="text-sm font-medium text-text-primary truncate">
            {data.label}
          </span>
        </div>

        {/* Service Box specific content */}
        {data.nodeType === 'service-box' && (
          <div className="mt-2 space-y-1">
            <div className="text-xs text-text-muted">
              REST Services: {data.config?.restServices?.length || 0}
            </div>
            <button
              onClick={handleRestServiceClick}
              className="w-full flex items-center gap-1 px-2 py-1 text-xs bg-success text-white hover:bg-green-600 rounded transition-colors"
            >
              <Settings size={10} />
              Add REST Services
            </button>
          </div>
        )}

        {/* Node Status Indicator */}
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span className="truncate">
            {data.nodeType?.replace('-', ' ').toUpperCase()}
          </span>
          <div 
            className={`
              w-2 h-2 rounded-full
              ${data.status === 'error' ? 'bg-error' : 
                data.status === 'success' ? 'bg-success' : 
                'bg-gray-300'}
            `}
          />
        </div>
      </div>

      {/* Output Handle */}
      {data.outputs && data.outputs.length > 0 && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-primary !border-2 !border-white"
          style={{ top: '50%', right: '-6px' }}
        />
      )}

      {/* Multiple Output Handles */}
      {data.outputs && data.outputs.length > 1 && data.outputs.map((output: any, index: number) => (
        <Handle
          key={output.id}
          type="source"
          position={Position.Right}
          id={output.id}
          className="w-2 h-2 !bg-secondary !border-2 !border-white"
          style={{ 
            top: `${30 + (index * 40)}%`,
            right: '-4px'
          }}
        />
      ))}
    </div>
  );
}