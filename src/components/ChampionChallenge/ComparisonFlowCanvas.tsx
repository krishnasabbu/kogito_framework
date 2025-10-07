import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  ConnectionLineType,
} from 'react-flow-renderer';
import { ComparisonFlowNode } from './ComparisonFlowNode';
import { NodeMetric } from '../../types/championChallenge';
import { Card } from '../ui/card';

interface ComparisonFlowCanvasProps {
  championMetrics: NodeMetric[];
  challengeMetrics: NodeMetric[];
  onNodeClick?: (metric: NodeMetric) => void;
}

const nodeTypes = {
  comparisonNode: ComparisonFlowNode,
};

export const ComparisonFlowCanvas: React.FC<ComparisonFlowCanvasProps> = ({
  championMetrics,
  challengeMetrics,
  onNodeClick,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const championX = 50;
    const challengeX = 400;
    const startY = 100;
    const verticalSpacing = 180;

    championMetrics.forEach((metric, index) => {
      const nodeId = `champion-${metric.nodeId}-${index}`;

      nodes.push({
        id: nodeId,
        type: 'comparisonNode',
        position: { x: championX, y: startY + index * verticalSpacing },
        draggable: true,
        data: {
          metric,
          variant: 'champion',
          isHighlighted: selectedNodeId === nodeId,
          onClick: () => {
            setSelectedNodeId(nodeId);
            onNodeClick?.(metric);
          },
        },
      });

      if (index > 0) {
        edges.push({
          id: `champion-edge-${index}`,
          source: `champion-${championMetrics[index - 1].nodeId}-${index - 1}`,
          target: nodeId,
          type: 'smoothstep',
          animated: metric.status === 'success',
          style: {
            stroke: metric.status === 'error' ? '#ef4444' : '#C40404',
            strokeWidth: 2,
          },
        });
      }
    });

    challengeMetrics.forEach((metric, index) => {
      const nodeId = `challenge-${metric.nodeId}-${index}`;

      nodes.push({
        id: nodeId,
        type: 'comparisonNode',
        position: { x: challengeX, y: startY + index * verticalSpacing },
        draggable: true,
        data: {
          metric,
          variant: 'challenge',
          isHighlighted: selectedNodeId === nodeId,
          onClick: () => {
            setSelectedNodeId(nodeId);
            onNodeClick?.(metric);
          },
        },
      });

      if (index > 0) {
        edges.push({
          id: `challenge-edge-${index}`,
          source: `challenge-${challengeMetrics[index - 1].nodeId}-${index - 1}`,
          target: nodeId,
          type: 'smoothstep',
          animated: metric.status === 'success',
          style: {
            stroke: metric.status === 'error' ? '#ef4444' : '#FFD700',
            strokeWidth: 2,
          },
        });
      }
    });

    const maxLength = Math.max(championMetrics.length, challengeMetrics.length);
    for (let i = 0; i < maxLength; i++) {
      if (championMetrics[i] && challengeMetrics[i]) {
        edges.push({
          id: `comparison-${i}`,
          source: `champion-${championMetrics[i].nodeId}-${i}`,
          target: `challenge-${challengeMetrics[i].nodeId}-${i}`,
          type: 'straight',
          animated: false,
          style: {
            stroke: '#94a3b8',
            strokeWidth: 1,
            strokeDasharray: '5,5',
          },
          label: `Δ ${Math.abs(
            championMetrics[i].executionTimeMs - challengeMetrics[i].executionTimeMs
          ).toFixed(0)}ms`,
          labelStyle: {
            fill: '#64748b',
            fontSize: 10,
            fontWeight: 600,
          },
        });
      }
    }

    return { nodes, edges };
  }, [championMetrics, challengeMetrics, selectedNodeId, onNodeClick]);

  const onNodesChange = useCallback((changes: any) => {
  }, []);
  const onEdgesChange = useCallback(() => {}, []);

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-4 left-4 z-10">
        <Card className="p-3 bg-white shadow-lg">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-wells-red"></div>
              <span className="font-medium font-wells">Champion</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-wells-gold"></div>
              <span className="font-medium font-wells">Challenge</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <Card className="p-3 bg-white shadow-lg">
          <div className="text-sm space-y-1">
            <div className="font-semibold">Metrics Summary</div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Champion Nodes:</span>
              <span className="font-mono font-semibold">{championMetrics.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Challenge Nodes:</span>
              <span className="font-mono font-semibold">{challengeMetrics.length}</span>
            </div>
          </div>
        </Card>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        fitView
        minZoom={0.1}
        maxZoom={2}
      >
        <Background color="#e2e8f0" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const variant = node.data?.variant;
            return variant === 'champion' ? '#C40404' : '#FFD700';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
};
