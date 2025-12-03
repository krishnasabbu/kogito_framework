import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { LangGraphFlow, LangGraphNode, LangGraphEdge } from '../../types/langgraph';
import { langGraphApiService } from '../../services/langGraphApiService';
import { Plus, Save, Play, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const LangGraphFlowBuilder: React.FC = () => {
  const [flowName, setFlowName] = useState('');
  const [flowDescription, setFlowDescription] = useState('');
  const [nodes, setNodes] = useState<LangGraphNode[]>([]);
  const [edges, setEdges] = useState<LangGraphEdge[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const addNode = () => {
    const newNode: LangGraphNode = {
      id: `node-${Date.now()}`,
      type: 'api',
      name: `Node ${nodes.length + 1}`,
      config: {
        method: 'POST',
        endpoint: '',
        headers: {}
      }
    };
    setNodes([...nodes, newNode]);
  };

  const removeNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setEdges(edges.filter(e => e.from !== nodeId && e.to !== nodeId));
  };

  const updateNode = (nodeId: string, updates: Partial<LangGraphNode>) => {
    setNodes(nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n));
  };

  const addEdge = (from: string, to: string) => {
    const newEdge: LangGraphEdge = {
      id: `edge-${Date.now()}`,
      from,
      to
    };
    setEdges([...edges, newEdge]);
  };

  const handleCreate = async () => {
    if (!flowName.trim()) {
      toast.error('Flow name is required');
      return;
    }

    if (nodes.length === 0) {
      toast.error('Add at least one node');
      return;
    }

    setIsCreating(true);

    try {
      const flow = await langGraphApiService.createFlow({
        name: flowName,
        description: flowDescription,
        nodes,
        edges,
        state_schema: {},
        config: {
          timeout: 300000,
          retries: 3
        }
      });

      toast.success(`Flow "${flow.name}" created successfully!`);

      setFlowName('');
      setFlowDescription('');
      setNodes([]);
      setEdges([]);
    } catch (error) {
      console.error('Failed to create flow:', error);
      toast.error('Failed to create flow');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>LangGraph Flow Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="flowName">Flow Name *</Label>
              <Input
                id="flowName"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                placeholder="e.g., Customer Onboarding Flow"
              />
            </div>

            <div>
              <Label htmlFor="flowDescription">Description</Label>
              <Input
                id="flowDescription"
                value={flowDescription}
                onChange={(e) => setFlowDescription(e.target.value)}
                placeholder="Describe what this flow does"
              />
            </div>
          </div>

          {/* Nodes Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Nodes</h3>
              <Button onClick={addNode} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Node
              </Button>
            </div>

            <div className="space-y-4">
              {nodes.map((node) => (
                <Card key={node.id} className="bg-gray-50 dark:bg-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <Input
                        value={node.name}
                        onChange={(e) => updateNode(node.id, { name: e.target.value })}
                        className="font-semibold"
                        placeholder="Node name"
                      />
                      <Button
                        onClick={() => removeNode(node.id)}
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Type</Label>
                        <select
                          value={node.type}
                          onChange={(e) => updateNode(node.id, { type: e.target.value as any })}
                          className="w-full mt-1 p-2 border rounded"
                        >
                          <option value="api">API Call</option>
                          <option value="llm">LLM</option>
                          <option value="function">Function</option>
                          <option value="conditional">Conditional</option>
                          <option value="transform">Transform</option>
                        </select>
                      </div>

                      <div>
                        <Label className="text-xs">Method</Label>
                        <select
                          value={node.config.method || 'POST'}
                          onChange={(e) => updateNode(node.id, {
                            config: { ...node.config, method: e.target.value as any }
                          })}
                          className="w-full mt-1 p-2 border rounded"
                        >
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                          <option value="PUT">PUT</option>
                          <option value="DELETE">DELETE</option>
                        </select>
                      </div>

                      <div className="col-span-2">
                        <Label className="text-xs">Endpoint URL</Label>
                        <Input
                          value={node.config.endpoint || ''}
                          onChange={(e) => updateNode(node.id, {
                            config: { ...node.config, endpoint: e.target.value }
                          })}
                          placeholder="https://api.example.com/endpoint"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {nodes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No nodes yet. Click "Add Node" to get started.
                </div>
              )}
            </div>
          </div>

          {/* Edges Section */}
          {nodes.length > 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Connections</h3>
              <div className="space-y-2">
                {nodes.slice(0, -1).map((node, idx) => {
                  const nextNode = nodes[idx + 1];
                  const edgeExists = edges.some(e => e.from === node.id && e.to === nextNode.id);

                  return (
                    <div key={node.id} className="flex items-center gap-2">
                      <span className="text-sm">{node.name}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-sm">{nextNode.name}</span>
                      {!edgeExists && (
                        <Button
                          onClick={() => addEdge(node.id, nextNode.id)}
                          size="sm"
                          variant="outline"
                        >
                          Connect
                        </Button>
                      )}
                      {edgeExists && (
                        <span className="text-xs text-green-600">✓ Connected</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button
              onClick={handleCreate}
              disabled={isCreating || !flowName || nodes.length === 0}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {isCreating ? 'Creating...' : 'Create Flow'}
            </Button>

            <Button variant="outline" disabled={isCreating}>
              <Play className="w-4 h-4 mr-2" />
              Test Flow
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
