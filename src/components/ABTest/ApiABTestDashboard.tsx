import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Play, Pause, Trash2, BarChart3, Clock, CheckCircle, XCircle } from 'lucide-react';
import { ApiABTest, ApiABTestMetrics } from '../../types/apiAbtest';
import { apiABTestService } from '../../services/apiAbtestService';
import { ApiABTestCreator } from './ApiABTestCreator';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export const ApiABTestDashboard: React.FC = () => {
  const [tests, setTests] = useState<ApiABTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<ApiABTest | null>(null);
  const [metrics, setMetrics] = useState<ApiABTestMetrics | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    if (selectedTest) {
      loadMetrics(selectedTest.id);
    }
  }, [selectedTest]);

  const loadTests = async () => {
    setIsLoading(true);
    try {
      const data = await apiABTestService.getAllTests();
      setTests(data);
      if (data.length > 0 && !selectedTest) {
        setSelectedTest(data[0]);
      }
    } catch (error) {
      console.error('Failed to load tests:', error);
      toast.error('Failed to load A/B tests');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMetrics = async (testId: string) => {
    try {
      const data = await apiABTestService.getMetrics(testId);
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const handleStartTest = async (testId: string) => {
    try {
      await apiABTestService.startTest(testId);
      toast.success('Test started');
      loadTests();
    } catch (error) {
      toast.error('Failed to start test');
    }
  };

  const handlePauseTest = async (testId: string) => {
    try {
      await apiABTestService.pauseTest(testId);
      toast.success('Test paused');
      loadTests();
    } catch (error) {
      toast.error('Failed to pause test');
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return;

    try {
      await apiABTestService.deleteTest(testId);
      toast.success('Test deleted');
      loadTests();
      if (selectedTest?.id === testId) {
        setSelectedTest(null);
      }
    } catch (error) {
      toast.error('Failed to delete test');
    }
  };

  const handleExecuteTest = async () => {
    if (!selectedTest) return;

    try {
      const execution = await apiABTestService.executeTest({
        testId: selectedTest.id
      });

      toast.success(`Executed via ${execution.variantName} (${execution.latencyMs}ms)`);
      loadMetrics(selectedTest.id);
    } catch (error) {
      toast.error('Failed to execute test');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading A/B tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API A/B Testing</h1>
          <p className="text-gray-600 dark:text-gray-400">Compare different API endpoints for optimal performance</p>
        </div>

        <Button onClick={() => setShowCreator(true)} className="bg-gradient-to-r from-blue-600 to-purple-600">
          <Plus className="w-4 h-4 mr-2" />
          Create Test
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-6 flex-1">
        <div className="col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Active Tests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tests.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No tests yet
                </p>
              ) : (
                tests.map(test => (
                  <div
                    key={test.id}
                    onClick={() => setSelectedTest(test)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedTest?.id === test.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                        : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm">{test.name}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          test.status === 'running'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : test.status === 'paused'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {test.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{test.description}</p>
                    <div className="flex gap-1">
                      {test.variants.map(v => (
                        <div
                          key={v.id}
                          className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded"
                        >
                          {v.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3 space-y-6">
          {selectedTest ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedTest.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTest.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedTest.status !== 'running' ? (
                        <Button onClick={() => handleStartTest(selectedTest.id)} size="sm" variant="outline">
                          <Play className="w-4 h-4 mr-2" />
                          Start
                        </Button>
                      ) : (
                        <Button onClick={() => handlePauseTest(selectedTest.id)} size="sm" variant="outline">
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </Button>
                      )}

                      <Button
                        onClick={handleExecuteTest}
                        disabled={selectedTest.status !== 'running'}
                        size="sm"
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Execute Now
                      </Button>

                      <Button onClick={() => handleDeleteTest(selectedTest.id)} size="sm" variant="outline">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {metrics && (
                <>
                  <div className="grid grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total Executions</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.totalExecutions}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {Object.values(metrics.variantStats).map(stats => (
                      <Card key={stats.variantId}>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">{stats.variantName}</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.avgLatency.toFixed(0)}ms</p>
                            <p className="text-xs text-gray-500">{(stats.successRate * 100).toFixed(1)}% success</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Latency Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={Object.values(metrics.variantStats)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="variantName" />
                          <YAxis label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft' }} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="avgLatency" fill="#3b82f6" name="Avg Latency" />
                          <Bar dataKey="p95Latency" fill="#8b5cf6" name="P95 Latency" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {metrics.timeSeriesData.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Over Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={metrics.timeSeriesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="timestamp"
                              tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                            />
                            <YAxis label={{ value: 'Avg Latency (ms)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip
                              labelFormatter={(value) => new Date(value).toLocaleString()}
                            />
                            <Legend />
                            {selectedTest.variants.map((variant, index) => (
                              <Line
                                key={variant.id}
                                type="monotone"
                                dataKey={`variantData.${variant.id}.avgLatency`}
                                stroke={index === 0 ? '#3b82f6' : '#8b5cf6'}
                                name={variant.name}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle>Success Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.values(metrics.variantStats).map(stats => (
                          <div key={stats.variantId}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">{stats.variantName}</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {(stats.successRate * 100).toFixed(2)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${stats.successRate * 100}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                {Math.floor(stats.executions * stats.successRate)} success
                              </span>
                              <span className="flex items-center gap-1">
                                <XCircle className="w-3 h-3 text-red-500" />
                                {Math.floor(stats.executions * stats.errorRate)} errors
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Latency Percentiles</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="text-left py-2 px-4">Variant</th>
                              <th className="text-right py-2 px-4">P50</th>
                              <th className="text-right py-2 px-4">P90</th>
                              <th className="text-right py-2 px-4">P95</th>
                              <th className="text-right py-2 px-4">P99</th>
                              <th className="text-right py-2 px-4">Min</th>
                              <th className="text-right py-2 px-4">Max</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.values(metrics.variantStats).map(stats => (
                              <tr key={stats.variantId} className="border-b border-gray-100 dark:border-gray-800">
                                <td className="py-2 px-4 font-medium">{stats.variantName}</td>
                                <td className="text-right py-2 px-4">{stats.p50Latency.toFixed(0)}ms</td>
                                <td className="text-right py-2 px-4">
                                  {(metrics.latencyPercentiles[stats.variantId]?.p90 || 0).toFixed(0)}ms
                                </td>
                                <td className="text-right py-2 px-4">{stats.p95Latency.toFixed(0)}ms</td>
                                <td className="text-right py-2 px-4">{stats.p99Latency.toFixed(0)}ms</td>
                                <td className="text-right py-2 px-4">{stats.minLatency.toFixed(0)}ms</td>
                                <td className="text-right py-2 px-4">{stats.maxLatency.toFixed(0)}ms</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {!metrics && selectedTest.status === 'draft' && (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center">
                      <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Data Yet</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Start the test to begin collecting performance metrics
                      </p>
                      <Button onClick={() => handleStartTest(selectedTest.id)}>
                        <Play className="w-4 h-4 mr-2" />
                        Start Test
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Test Selected</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Select a test from the list or create a new one to get started
                  </p>
                  <Button onClick={() => setShowCreator(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {showCreator && (
        <ApiABTestCreator
          onClose={() => setShowCreator(false)}
          onSave={() => {
            setShowCreator(false);
            loadTests();
          }}
        />
      )}
    </div>
  );
};
