import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  ReactFlowProvider,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
} from 'react-flow-renderer';
import { useFlowStore } from '../../stores/flowStore';
import { FlowNode, FlowEdge } from '../../types/flow';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

interface FlowCanvasProps {
  onNodeContextMenu: (event: React.MouseEvent, node: Node) => void;
  onCanvasContextMenu: (event: React.MouseEvent) => void;
}

function FlowCanvasInner({ onNodeContextMenu, onCanvasContextMenu }: FlowCanvasProps) {
  const { 
    currentFlow, 
    updateFlowNodes, 
    updateFlowEdges, 
    selectNode, 
    selectEdge 
  } = useFlowStore();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Initialize nodes and edges from current flow
  useEffect(() => {
    if (currentFlow?.nodes) {
      const reactFlowNodes = currentFlow.nodes.map(node => ({
        id: node.id,
        type: 'custom',
        position: node.position,
        data: {
          ...node.data,
          nodeType: node.type,
        },
      }));
      setNodes(reactFlowNodes);
    }
  }, [currentFlow?.nodes, setNodes]);

  useEffect(() => {
    if (currentFlow?.edges) {
      const reactFlowEdges = currentFlow.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'custom',
        data: edge.data,
      }));
      setEdges(reactFlowEdges);
    }
  }, [currentFlow?.edges, setEdges]);

  // Sync with store when nodes/edges change
  const handleNodesChange: OnNodesChange = useCallback((changes) => {
    onNodesChange(changes);
    
    // Update store after a short delay to avoid too many updates
    setTimeout(() => {
      setNodes((currentNodes) => {
        const flowNodes: FlowNode[] = currentNodes.map(node => ({
          id: node.id,
          type: node.data?.nodeType || 'transform',
          position: node.position,
          data: node.data,
        }));
        updateFlowNodes(flowNodes);
        return currentNodes;
      });
    }, 100);
  }, [onNodesChange, updateFlowNodes]);

  const handleEdgesChange: OnEdgesChange = useCallback((changes) => {
    onEdgesChange(changes);
    
    // Update store after a short delay
    setTimeout(() => {
      setEdges((currentEdges) => {
        const flowEdges: FlowEdge[] = currentEdges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
          data: edge.data,
        }));
        updateFlowEdges(flowEdges);
        return currentEdges;
      });
    }, 100);
  }, [onEdgesChange, updateFlowEdges]);

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        type: 'custom',
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation();
    const flowNode: FlowNode = {
      id: node.id,
      type: node.data?.nodeType || 'transform',
      position: node.position,
      data: node.data,
    };
    selectNode(flowNode);
  }, [selectNode]);

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    const flowEdge: FlowEdge = {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type,
      data: edge.data,
    };
    selectEdge(flowEdge);
  }, [selectEdge]);

  const onPaneClick = useCallback(() => {
    selectNode(null);
    selectEdge(null);
  }, [selectNode, selectEdge]);

  return (
    <div className="flex-1 bg-surface relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        onPaneContextMenu={onCanvasContextMenu}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
        }}
        connectionLineStyle={{ 
          stroke: '#C8102E', 
          strokeWidth: 2,
          strokeDasharray: '5,5'
        }}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.2}
        maxZoom={2}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode={['Meta', 'Ctrl']}
        snapToGrid={true}
        snapGrid={[15, 15]}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1} 
          color="#E5E5E5"
        />
        <Controls 
          className="bg-white border border-gray-200 rounded-lg shadow-wells"
          showInteractive={false}
          showFitView={true}
          showZoom={true}
        />
        <MiniMap 
          className="bg-white border border-gray-200 rounded-lg shadow-wells"
          nodeColor="#C8102E"
          maskColor="rgba(255, 255, 255, 0.8)"
          position="top-right"
          pannable={true}
          zoomable={true}
        />
      </ReactFlow>
    </div>
  );
}

export default function FlowCanvas(props: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}