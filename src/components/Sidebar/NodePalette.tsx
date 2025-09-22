import React from 'react';
import { nodeTypes } from '../../data/nodeTypes';
import { NodeType } from '../../types/flow';
import * as Icons from 'lucide-react';

interface NodePaletteProps {
  onDragStart: (event: React.DragEvent, nodeType: NodeType) => void;
}

export default function NodePalette({ onDragStart }: NodePaletteProps) {
  // Only show service-box node
  const serviceBoxNode = nodeTypes.find(node => node.type === 'service-box');
  
  if (!serviceBoxNode) return null;

  const IconComponent = Icons[serviceBoxNode.icon as keyof typeof Icons] as React.ComponentType<any>;

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Node Palette</h3>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-text-muted uppercase tracking-wide">
          Services
        </h4>
        
        <div
          draggable
          onDragStart={(event) => onDragStart(event, serviceBoxNode)}
          className="flex items-center gap-3 p-3 rounded-lg border cursor-move transition-all duration-200 hover:shadow-wells bg-blue-50 border-blue-200 text-blue-800"
          style={{ 
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none'
          }}
          onDragEnd={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onDrag={(e) => {
            e.currentTarget.style.opacity = '0.5';
          }}
        >
          <div className="flex-shrink-0 w-5 h-5">
            <IconComponent size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {serviceBoxNode.label}
            </div>
            <div className="text-xs opacity-75 truncate">
              Drag to canvas
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}