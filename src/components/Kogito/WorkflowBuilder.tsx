import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  ReactFlowProvider,
  OnConnect,
} from 'react-flow-renderer';
import { Info, Link as LinkIcon, Server, Database, Zap, Search } from 'lucide-react';
import { useServicesStore } from '../../stores/servicesStore';
import { InitialRequestConfig, RestServiceConfig } from '../../types/kogito';
import ServiceInfoModal from './ServiceInfoModal';
import ServiceMappingModal from './ServiceMappingModal';
import { v4 as uuidv4 } from 'uuid';

interface WorkflowBuilderProps {
  initialRequestConfig: InitialRequestConfig | null;
  nodes: any[];
  edges: any[];
  serviceMappings: Record<string, RestServiceConfig>;
  onWorkflowChange: (workflow: any) => void;
}

// Custom Node Component
const ServiceNode = ({ data, selected }: any) => {
  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    data.onInfo();
  };

  const handleMappingClick = (e: React.MouseEvent) => {
    
    e.stopPropagation();
    data.onMapping(data.nodeId);
    console.log("clicking.... "+ data.nodeId);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-600';
      case 'POST': return 'bg-green-600';
      case 'PUT': return 'bg-yellow-600';
      case 'DELETE': return 'bg-red-600';
      case 'PATCH': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div
      className={`
        bg-dark-surface border-2 rounded-lg shadow-lg min-w-[220px] transition-all duration-200
        ${selected ? 'border-wells-red shadow-red-900/50' : 'border-dark-border'}
      `}
    >
      {/* Service Header */}
      <div className="p-4 border-b border-dark-border">
        <div className="flex items-center gap-2 mb-2">
          <Server size={16} className="text-wells-red" />
          <span className="font-semibold text-dark-text-primary text-sm">
            {data.service.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 text-xs font-medium text-white rounded ${getMethodColor(
              data.service.method
            )}`}
          >
            {data.service.method}
          </span>
          <span className="text-xs text-dark-text-secondary truncate max-w-[140px]">
            {data.service.url}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-3 flex items-center justify-center gap-2">
        <button
          onClick={handleInfoClick}
          className="flex items-center gap-1 px-3 py-2 text-xs bg-blue-900/30 text-blue-300 hover:bg-blue-900/50 rounded-md transition-colors border border-blue-800"
          title="Service Information"
        >
          <Info size={12} />
          Info
        </button>

        <button
          onClick={handleMappingClick}
          className="flex items-center gap-1 px-3 py-2 text-xs bg-green-900/30 text-green-300 hover:bg-green-900/50 rounded-md transition-colors border border-green-800"
          title="Field Mapping"
        >
          <LinkIcon size={12} />
          Map
        </button>
      </div>

      {/* Mapping Status */}
      {data.mappingConfigured && (
        <div className="px-3 pb-3">
          <div className="text-xs text-green-300 bg-green-900/20 px-2 py-1 rounded text-center border border-green-800">
            ✓ Mapped
          </div>
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  serviceNode: ServiceNode,
};

function WorkflowBuilderInner({
  initialRequestConfig,
  nodes: initialNodes,
  edges: initialEdges,
  serviceMappings: initialServiceMappings,
  onWorkflowChange,
}: WorkflowBuilderProps) {
  const { services, loadServices } = useServicesStore();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showServiceInfo, setShowServiceInfo] = useState(false);
  const [showServiceMapping, setShowServiceMapping] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [serviceMappings, setServiceMappings] = useState<Record<string, RestServiceConfig>>(
    initialServiceMappings
  );
  const [searchTerm, setSearchTerm] = useState('');

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Refs for latest callback and latest state (to avoid stale closures)
  const latestOnWorkflowChange = useRef(onWorkflowChange);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const serviceMappingsRef = useRef(serviceMappings);

  // Track if initial sync from props is done
  const isInitialSyncDone = useRef(false);
  const hasInitializedOnce = useRef(false);

  useEffect(() => {
    latestOnWorkflowChange.current = onWorkflowChange;
  }, [onWorkflowChange]);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  useEffect(() => {
    serviceMappingsRef.current = serviceMappings;
  }, [serviceMappings]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // ✅ Initialize ONLY ONCE - no dependencies on arrays/objects
  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitializedOnce.current) return;
    
    console.log('Initializing with data:', { 
      nodesCount: initialNodes.length, 
      edgesCount: initialEdges.length, 
      mappingsCount: Object.keys(initialServiceMappings).length 
    });
    
    console.log('Initializing with data:', { 
      nodesCount: initialNodes.length, 
      edgesCount: initialEdges.length, 
      mappingsCount: Object.keys(initialServiceMappings).length 
    });
    
    console.log('Initializing with data:', { 
      nodesCount: initialNodes.length, 
      edgesCount: initialEdges.length, 
      mappingsCount: Object.keys(initialServiceMappings).length 
    });
    
    if (
      initialNodes.length > 0 ||
      initialEdges.length > 0 ||
      Object.keys(initialServiceMappings).length > 0
    ) {
      // Update nodes with proper callback handlers
      const nodesWithHandlers = initialNodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          mappingConfigured: initialServiceMappings[node.data.nodeId] ? true : false,
          onInfo: () => {
            setSelectedService(node.data.service);
            setShowServiceInfo(true);
          },
          onMapping: (id: string) => {
            console.log('Opening mapping for existing nodeId:', id);
            setSelectedService(node.data.service);
            setSelectedNodeId(id);
            setShowServiceMapping(true);
          },
        }
      }));
      
      setNodes(nodesWithHandlers);
      setEdges(initialEdges);
      setServiceMappings(initialServiceMappings);

      latestOnWorkflowChange.current({
        nodes: nodesWithHandlers,
        edges: initialEdges,
        serviceMappings: initialServiceMappings,
      });

      isInitialSyncDone.current = true;
    }
    
    hasInitializedOnce.current = true;
  }, []); // ✅ Empty dependency array - runs only once

  // ✅ Deep-compare signature to avoid infinite loop
  const workflowSignature = useMemo(() => {
    try {
      return JSON.stringify({
        nodes,
        edges,
        serviceMappings,
      });
    } catch (e) {
      console.error('Failed to stringify workflow for comparison', e);
      return '';
    }
  }, [nodes, edges, serviceMappings]);

  // ✅ Notify parent ONLY when content changes (deep compare via signature)
  useEffect(() => {
    // Skip if empty
    if (
      nodes.length === 0 &&
      edges.length === 0 &&
      Object.keys(serviceMappings).length === 0
    ) {
      return;
    }

    // Skip if this is the initial sync (already handled above)
    if (!isInitialSyncDone.current) {
      return;
    }

    console.log('Notifying parent of workflow changes');
    latestOnWorkflowChange.current({
      nodes,
      edges,
      serviceMappings,
    });
  }, [workflowSignature]);

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onDragStart = useCallback((event: React.DragEvent, service: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(service));
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const serviceData = event.dataTransfer.getData('application/reactflow');
      if (!serviceData) return;

      try {
        const service = JSON.parse(serviceData);
        const position = {
          x: event.clientX - reactFlowBounds.left - 100,
          y: event.clientY - reactFlowBounds.top - 50,
        };

        const nodeId = uuidv4();

        const newNode: Node = {
          id: nodeId,
          type: 'serviceNode',
          position,
          data: {
            nodeId,
            service,
            mappingConfigured: serviceMappings[nodeId] ? true : false,
            onInfo: () => {
              setSelectedService(service);
              setShowServiceInfo(true);
            },
            onMapping: (id: string) => {
              console.log('Opening mapping for nodeId:', id);
              setSelectedService(service);
              setSelectedNodeId(id);
              setShowServiceMapping(true);
            },
          },
        };

        setNodes((nds) => {
          const updated = nds.concat(newNode);
          nodesRef.current = updated;
          latestOnWorkflowChange.current({
            nodes: updated,
            edges: edgesRef.current,
            serviceMappings: serviceMappingsRef.current,
          });
          return updated;
        });
      } catch (error) {
        console.error('Error parsing dropped service data:', error);
      }
    },
    [setNodes, serviceMappings]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        type: 'smoothstep',
        animated: true,
      };

      setEdges((eds) => {
        const updated = addEdge(newEdge, eds);
        edgesRef.current = updated;
        latestOnWorkflowChange.current({
          nodes: nodesRef.current,
          edges: updated,
          serviceMappings: serviceMappingsRef.current,
        });
        return updated;
      });
    },
    [setEdges]
  );

  // ✅ Fixed handleMappingSave — batch updates if needed
  const handleMappingSave = (nodeId: string, mappingConfig: RestServiceConfig) => {
    console.log('Saving mapping for node:', nodeId, JSON.stringify(mappingConfig));

    // Update service mappings
    setServiceMappings((prev) => {
      const updatedMappings = { ...prev, [nodeId]: mappingConfig };
      serviceMappingsRef.current = updatedMappings;
      
      // Notify parent of changes
      latestOnWorkflowChange.current({
        nodes: nodesRef.current,
        edges: edgesRef.current,
        serviceMappings: updatedMappings,
      });
      
      
      // Notify parent of changes
      latestOnWorkflowChange.current({
        nodes: nodesRef.current,
        edges: edgesRef.current,
        serviceMappings: updatedMappings,
      });
      
      return updatedMappings;
    });

    // Update node to show mapping configured
    // Update node to show mapping configured
    setNodes((nds) =>
      nds.map((node) =>
        node.data.nodeId === nodeId
          ? { ...node, data: { ...node.data, mappingConfigured: true } }
          : node
      )
    );

    setShowServiceMapping(false);
    setSelectedService(null);
    setSelectedService(null);
    setSelectedNodeId(null);
  };

  const getCurrentMapping = () => {
    console.log("Getting mapping for nodeId:", selectedNodeId);
    console.log("Available mappings:", Object.keys(serviceMappings));
    if (!selectedNodeId) return null;
    const mapping = serviceMappings[selectedNodeId];
    console.log("Found mapping:", mapping ? 'Yes' : 'No');
    return mapping || null;
    console.log("Found mapping:", mapping ? 'Yes' : 'No');
    return mapping || null;
  };

  return (
    <div className="flex h-full">
      {/* Services Palette */}
      <div className="w-80 bg-dark-bg border-r border-dark-border flex flex-col">
        <div className="p-4 border-b border-dark-border">
          <h3 className="text-lg font-semibold text-dark-text-primary mb-2">Available Services</h3>
          <p className="text-sm text-dark-text-secondary mb-3">Drag services to the canvas</p>

          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-secondary"
            />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-dark-surface border border-dark-border text-dark-text-primary rounded-lg focus:ring-2 focus:ring-wells-red focus:border-transparent"
            />
          </div>
        </div>

        {/* Services List */}
        <div className="flex-1 p-4 overflow-y-auto">
          {!initialRequestConfig && (
            <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-300">⚠️ Set Initial Request JSON first to enable field mapping</p>
            </div>
          )}

          <div className="space-y-3">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                draggable
                onDragStart={(event) => onDragStart(event, service)}
                className="p-4 bg-dark-surface border border-dark-border rounded-lg cursor-move hover:border-wells-red hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Server size={16} className="text-wells-red" />
                  <span className="font-medium text-dark-text-primary text-sm">{service.name}</span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium text-white rounded ${
                      service.method === 'GET'
                        ? 'bg-blue-600'
                        : service.method === 'POST'
                        ? 'bg-green-600'
                        : service.method === 'PUT'
                        ? 'bg-yellow-600'
                        : service.method === 'DELETE'
                        ? 'bg-red-600'
                        : 'bg-purple-600'
                    }`}
                  >
                    {service.method}
                  </span>
                </div>

                <p className="text-xs text-dark-text-secondary truncate mb-1">{service.url}</p>

                {service.description && (
                  <p className="text-xs text-dark-text-secondary line-clamp-2">{service.description}</p>
                )}
              </div>
            ))}

            {filteredServices.length === 0 && (
              <div className="text-center py-8">
                <Database
                  size={32}
                  className="mx-auto mb-2 text-dark-text-secondary opacity-50"
                />
                <p className="text-sm text-dark-text-secondary">
                  {searchTerm ? 'No services match your search' : 'No services available'}
                </p>
                <p className="text-xs text-dark-text-secondary mt-1">
                  {searchTerm ? 'Try different search terms' : 'Create services first'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div
        ref={reactFlowWrapper}
        className="flex-1 bg-dark-bg relative"
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{
            padding: 0.2,
            includeHiddenNodes: false,
          }}
          connectionLineStyle={{
            stroke: '#d92d20',
            strokeWidth: 2,
            strokeDasharray: '5,5',
          }}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={0.2}
          maxZoom={2}
          snapToGrid={true}
          snapGrid={[15, 15]}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#374151" />
          <Controls
            className="bg-dark-surface border border-dark-border rounded-lg shadow-lg"
            showInteractive={false}
            showFitView={true}
            showZoom={true}
          />
          <MiniMap
            className="bg-dark-surface border border-dark-border rounded-lg shadow-lg"
            nodeColor="#d92d20"
            maskColor="rgba(17, 24, 39, 0.8)"
            position="top-right"
            pannable={true}
            zoomable={true}
          />
        </ReactFlow>

        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-dark-text-secondary">
              <Zap size={64} className="mx-auto mb-4 opacity-30 text-wells-red" />
              <h3 className="text-xl font-medium mb-2 text-dark-text-primary">Workflow Canvas</h3>
              <p className="text-sm">Drag services from the left panel to build your workflow</p>
              <p className="text-xs mt-2 opacity-75">Connect services to create your process flow</p>
            </div>
          </div>
        )}
      </div>

      {/* Service Info Modal */}
      {showServiceInfo && selectedService && (
        <ServiceInfoModal service={selectedService} onClose={() => setShowServiceInfo(false)} />
      )}

      {/* Service Mapping Modal */}
      {showServiceMapping && selectedService && selectedNodeId && (
        <ServiceMappingModal
          nodeId={selectedNodeId}
          service={selectedService}
          initialRequestConfig={initialRequestConfig}
          existingMapping={getCurrentMapping()}
          onSave={(nodeId: string, mappingConfig: RestServiceConfig) =>
            handleMappingSave(nodeId, mappingConfig)
          }
          onClose={() => {
            setShowServiceMapping(false);
            setSelectedNodeId(null);
          }}
        />
      )}
    </div>
  );
}

export default function WorkflowBuilder(props: WorkflowBuilderProps) {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderInner {...props} />
    </ReactFlowProvider>
  );
}