import React, { useState } from 'react';
import { X, Save, Plus, Trash2, Play } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ApiVariant, CreateApiABTestRequest } from '../../types/apiAbtest';
import { apiABTestService } from '../../services/apiAbtestService';
import toast from 'react-hot-toast';

interface ApiABTestCreatorProps {
  onClose: () => void;
  onSave?: () => void;
}

export const ApiABTestCreator: React.FC<ApiABTestCreatorProps> = ({ onClose, onSave }) => {
  const [testName, setTestName] = useState('');
  const [description, setDescription] = useState('');
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('POST');
  const [requestPayload, setRequestPayload] = useState('{}');
  const [headers, setHeaders] = useState('{}');
  const [variants, setVariants] = useState<Partial<ApiVariant>[]>([
    { name: 'API A (Control)', apiEndpoint: '', trafficPercentage: 50, isControl: true },
    { name: 'API B (Variant)', apiEndpoint: '', trafficPercentage: 50, isControl: false }
  ]);

  const [successCriteria, setSuccessCriteria] = useState({
    primaryMetric: 'latency' as const,
    minimumSampleSize: 100,
    confidenceLevel: 95,
    minimumDetectableEffect: 10,
    maxDurationDays: 7
  });

  const [isSaving, setIsSaving] = useState(false);

  const addVariant = () => {
    setVariants([...variants, {
      name: `API ${String.fromCharCode(65 + variants.length)}`,
      apiEndpoint: '',
      trafficPercentage: 0,
      isControl: false
    }]);

    redistributeTraffic();
  };

  const removeVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
    redistributeTraffic(newVariants);
  };

  const redistributeTraffic = (variantsList = variants) => {
    const percentage = Math.floor(100 / variantsList.length);
    const newVariants = variantsList.map((v, i) => ({
      ...v,
      trafficPercentage: i === 0 ? 100 - (percentage * (variantsList.length - 1)) : percentage
    }));
    setVariants(newVariants);
  };

  const updateVariant = (index: number, field: keyof ApiVariant, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const validateForm = (): boolean => {
    if (!testName.trim()) {
      toast.error('Test name is required');
      return false;
    }

    if (variants.length < 2) {
      toast.error('At least 2 API variants are required');
      return false;
    }

    for (const variant of variants) {
      if (!variant.name?.trim()) {
        toast.error('All variants must have a name');
        return false;
      }
      if (!variant.apiEndpoint?.trim()) {
        toast.error('All variants must have an API endpoint');
        return false;
      }
      try {
        new URL(variant.apiEndpoint);
      } catch {
        toast.error(`Invalid URL for ${variant.name}`);
        return false;
      }
    }

    try {
      if (requestPayload.trim()) JSON.parse(requestPayload);
      if (headers.trim()) JSON.parse(headers);
    } catch {
      toast.error('Invalid JSON in request payload or headers');
      return false;
    }

    const totalTraffic = variants.reduce((sum, v) => sum + (v.trafficPercentage || 0), 0);
    if (Math.abs(totalTraffic - 100) > 0.1) {
      toast.error('Traffic percentages must sum to 100%');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const request: CreateApiABTestRequest = {
        name: testName,
        description,
        method,
        requestPayload: requestPayload.trim() ? JSON.parse(requestPayload) : undefined,
        headers: headers.trim() ? JSON.parse(headers) : undefined,
        variants: variants.map(v => ({
          name: v.name!,
          description: v.description,
          apiEndpoint: v.apiEndpoint!,
          headers: v.headers,
          trafficPercentage: v.trafficPercentage!,
          isControl: v.isControl!
        })),
        trafficSplit: variants[0].trafficPercentage || 50,
        successCriteria
      };

      await apiABTestService.createTest(request);

      toast.success('A/B test created successfully!');
      onSave?.();
      onClose();
    } catch (error) {
      console.error('Failed to create test:', error);
      toast.error('Failed to create A/B test');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create API A/B Test</h2>
            <p className="text-gray-600 dark:text-gray-400">Compare different API endpoints to find the best performer</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="testName">Test Name *</Label>
                  <Input
                    id="testName"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="e.g., Payment API Comparison"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={2}
                    placeholder="Describe what you're testing"
                  />
                </div>

                <div>
                  <Label htmlFor="method">HTTP Method</Label>
                  <select
                    id="method"
                    value={method}
                    onChange={(e) => setMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="primaryMetric">Primary Metric</Label>
                  <select
                    id="primaryMetric"
                    value={successCriteria.primaryMetric}
                    onChange={(e) => setSuccessCriteria({ ...successCriteria, primaryMetric: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="latency">Latency</option>
                    <option value="success_rate">Success Rate</option>
                    <option value="error_rate">Error Rate</option>
                    <option value="throughput">Throughput</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="requestPayload">Request Payload (JSON)</Label>
                  <textarea
                    id="requestPayload"
                    value={requestPayload}
                    onChange={(e) => setRequestPayload(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                    rows={3}
                    placeholder='{"key": "value"}'
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="headers">Common Headers (JSON)</Label>
                  <textarea
                    id="headers"
                    value={headers}
                    onChange={(e) => setHeaders(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                    rows={2}
                    placeholder='{"Authorization": "Bearer token"}'
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">API Variants</h3>
              <Button onClick={addVariant} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Variant
              </Button>
            </div>

            {variants.map((variant, index) => (
              <Card key={index} className="p-4 bg-gray-50 dark:bg-gray-900 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Variant Name *</Label>
                      <Input
                        value={variant.name || ''}
                        onChange={(e) => updateVariant(index, 'name', e.target.value)}
                        placeholder="API A"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Traffic %</Label>
                      <Input
                        type="number"
                        value={variant.trafficPercentage || 0}
                        onChange={(e) => updateVariant(index, 'trafficPercentage', parseInt(e.target.value))}
                        min="0"
                        max="100"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label className="text-xs">API Endpoint * (Full URL)</Label>
                      <Input
                        value={variant.apiEndpoint || ''}
                        onChange={(e) => updateVariant(index, 'apiEndpoint', e.target.value)}
                        placeholder="https://api.example.com/endpoint"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label className="text-xs">Custom Headers (JSON, optional)</Label>
                      <Input
                        value={JSON.stringify(variant.headers || {})}
                        onChange={(e) => {
                          try {
                            updateVariant(index, 'headers', JSON.parse(e.target.value));
                          } catch {
                            //  Invalid JSON, ignore
                          }
                        }}
                        placeholder='{"X-Custom": "value"}'
                      />
                    </div>

                    <div className="col-span-2 flex items-center">
                      <input
                        type="checkbox"
                        checked={variant.isControl}
                        onChange={(e) => {
                          const newVariants = variants.map((v, i) => ({
                            ...v,
                            isControl: i === index ? e.target.checked : false
                          }));
                          setVariants(newVariants);
                        }}
                        className="mr-2"
                      />
                      <Label className="text-xs">Control (Baseline)</Label>
                    </div>
                  </div>

                  {variants.length > 2 && (
                    <Button
                      onClick={() => removeVariant(index)}
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Traffic Distribution</h4>
              <div className="flex items-center gap-2">
                {variants.map((variant, index) => (
                  <div
                    key={index}
                    className="h-8 bg-blue-500 dark:bg-blue-600 rounded flex items-center justify-center text-white text-sm font-medium"
                    style={{ width: `${variant.trafficPercentage}%` }}
                  >
                    {variant.trafficPercentage}%
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2 text-xs text-blue-700 dark:text-blue-300">
                {variants.map((v, i) => (
                  <span key={i}>{v.name}: {v.trafficPercentage}%</span>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Success Criteria</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Minimum Sample Size</Label>
                <Input
                  type="number"
                  value={successCriteria.minimumSampleSize}
                  onChange={(e) => setSuccessCriteria({ ...successCriteria, minimumSampleSize: parseInt(e.target.value) })}
                  min="10"
                />
              </div>

              <div>
                <Label className="text-xs">Confidence Level (%)</Label>
                <select
                  value={successCriteria.confidenceLevel}
                  onChange={(e) => setSuccessCriteria({ ...successCriteria, confidenceLevel: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="90">90%</option>
                  <option value="95">95%</option>
                  <option value="99">99%</option>
                </select>
              </div>

              <div>
                <Label className="text-xs">Min Detectable Effect (%)</Label>
                <Input
                  type="number"
                  value={successCriteria.minimumDetectableEffect}
                  onChange={(e) => setSuccessCriteria({ ...successCriteria, minimumDetectableEffect: parseInt(e.target.value) })}
                  min="1"
                  max="100"
                />
              </div>

              <div>
                <Label className="text-xs">Max Duration (Days)</Label>
                <Input
                  type="number"
                  value={successCriteria.maxDurationDays}
                  onChange={(e) => setSuccessCriteria({ ...successCriteria, maxDurationDays: parseInt(e.target.value) })}
                  min="1"
                  max="365"
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Creating...' : 'Create A/B Test'}
          </Button>
        </div>
      </div>
    </div>
  );
};
