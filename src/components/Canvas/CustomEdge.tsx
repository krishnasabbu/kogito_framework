import React from 'react';
import { EdgeProps, getBezierPath } from 'react-flow-renderer';
import { X } from 'lucide-react';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <path
        id={id}
        className={`react-flow__edge-path ${selected ? 'stroke-primary' : 'stroke-gray-400'}`}
        d={edgePath}
        strokeWidth={selected ? 3 : 2}
        fill="none"
      />
      
      {/* Edge Label */}
      {data?.condition && (
        <foreignObject
          width={100}
          height={24}
          x={labelX - 50}
          y={labelY - 12}
          className="overflow-visible"
        >
          <div className="flex items-center justify-center">
            <div className="bg-secondary text-text-primary text-xs px-2 py-1 rounded-full border-2 border-white shadow-sm">
              {data.condition}
            </div>
          </div>
        </foreignObject>
      )}

      {/* Delete Button */}
      {selected && (
        <foreignObject
          width={20}
          height={20}
          x={labelX - 10}
          y={labelY - 10}
          className="overflow-visible"
        >
          <button
            className="w-5 h-5 bg-error text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors"
            onClick={(event) => {
              event.stopPropagation();
              // TODO: Implement edge deletion
            }}
          >
            <X size={12} />
          </button>
        </foreignObject>
      )}
    </>
  );
}