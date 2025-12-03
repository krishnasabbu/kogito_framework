import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Plus,
  Play,
  Pause,
  Trash2,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Target,
  Timer,
  ArrowLeft,
  RefreshCw,
  Calendar,
  Zap,
  AlertTriangle,
  PieChart,
  Edit
} from 'lucide-react';
import { ApiABTest, ApiABTestMetrics, ApiABTestExecution } from '../../types/apiAbtest';
import { apiABTestService } from '../../services/apiAbtestService';
import { ApiABTestCreator } from './ApiABTestCreator';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const timeFilters = [
  { label: 'Last 1 hour', value: '1h' },
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'All time', value: 'all' }
];

export const ApiABTestDashboard: React.FC = () => {
  const [tests, setTests] = useState<ApiABTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<ApiABTest | null>(null);
  const [metrics, setMetrics] = useState<ApiABTestMetrics | null>(null);
  const [executions, setExecutions] = useState<ApiABTestExecution[]>([]);
  const [showCreator, setShowCreator] = useState(false);
  const [testToEdit, setTestToEdit] = useState<ApiABTest | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('24h');
  const [view, setView] = useState<'list' | 'detail'>('list');

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    if (selectedTest) {
      loadMetrics(selectedTest.id);
      loadExecutions(selectedTest.id);
    }
  }, [selectedTest, timeFilter]);

  const loadTests = async () => {
    setIsLoading(true);
    try {
      const data = await apiABTestService.getAllTests();
      setTests(data);
      if (data.length > 0 && !selectedTest) {
        const firstRunningTest = data.find(t => t.status === 'running') || data[0];
        setSelectedTest(firstRunningTest);
        if (firstRunningTest.status === 'running') {
          setView('detail');
        }
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
      const data = await apiABTestService.getMetrics(testId, timeFilter);
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const loadExecutions = async (testId: string) => {
    try {
      const data = await apiABTestService.getExecutions(testId);
      setExecutions(data);
    } catch (error) {
      console.error('Failed to load executions:', error);
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
      setSelectedTest(null);
      setView('list');
      loadTests();
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
      loadExecutions(selectedTest.id);
    } catch (error) {
      toast.error('Failed to execute test');
    }
  };

  const handleSelectTest = (test: ApiABTest) => {
    setSelectedTest(test);
    setView('detail');
  };

  const handleEditTest = (test: ApiABTest) => {
    setTestToEdit(test);
    setShowCreator(true);
  };

  const handleCloseCreator = () => {
    setShowCreator(false);
    setTestToEdit(undefined);
  };

  const handleSaveTest = () => {
    setShowCreator(false);
    setTestToEdit(undefined);
    loadTests();
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

  if (view === 'list') {
    return (
      <div className="h-full p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API A/B Testing</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Compare different API endpoints for optimal performance
            </p>
          </div>

          <Button onClick={() => setShowCreator(true)} className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Test
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map(test => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer"
              onClick={() => handleSelectTest(test)}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{test.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{test.description}</p>
                    </div>
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
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar size={14} />
                      <span>Created {new Date(test.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {test.variants.map((v, index) => (
                        <div
                          key={v.id}
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: `${COLORS[index]}20`,
                            color: COLORS[index]
                          }}
                        >
                          {v.name} ({v.trafficPercentage}%)
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {tests.length === 0 && (
            <div className="col-span-3 text-center py-12">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Tests Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create your first A/B test to compare API endpoints
              </p>
              <Button onClick={() => setShowCreator(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Test
              </Button>
            </div>
          )}
        </div>

        {showCreator && (
          <ApiABTestCreator
            testToEdit={testToEdit}
            onClose={handleCloseCreator}
            onSave={handleSaveTest}
          />
        )}
      </div>
    );
  }

  if (!selectedTest) return null;

  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-gray-200 dark:border-gray-700 px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setView('list')} className="p-2">
              <ArrowLeft size={20} />
            </Button>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedTest.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>Created {new Date(selectedTest.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>Updated {new Date(selectedTest.updatedAt).toLocaleDateString()}</span>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    selectedTest.status === 'running'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                  }`}
                >
                  {selectedTest.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeFilters.map(filter => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedTest.status !== 'running' ? (
              <Button onClick={() => handleStartTest(selectedTest.id)} variant="outline">
                <Play className="w-4 h-4 mr-2" />
                Start
              </Button>
            ) : (
              <>
                <Button onClick={() => handlePauseTest(selectedTest.id)} variant="outline">
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
                <Button onClick={handleExecuteTest}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Execute Now
                </Button>
              </>
            )}

            <Button variant="outline" onClick={() => loadMetrics(selectedTest.id)}>
              <RefreshCw size={16} />
            </Button>

            <Button variant="outline" onClick={() => handleEditTest(selectedTest)}>
              <Edit className="w-4 h-4" />
            </Button>

            <Button variant="outline" onClick={() => handleDeleteTest(selectedTest.id)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="p-6">
        {metrics ? (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="enhanced">Enhanced Metrics</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="logs">Execution Logs</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <Activity className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Executions</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {metrics.totalExecutions}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {Object.values(metrics.variantStats)
                  .slice(0, 3)
                  .map((stats, index) => (
                    <Card key={stats.variantId}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <div
                            className="p-3 rounded-lg"
                            style={{ backgroundColor: `${COLORS[index]}20` }}
                          >
                            <Target className="w-6 h-6" style={{ color: COLORS[index] }} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{stats.variantName}</p>
                            <p className="text-2xl font-bold" style={{ color: COLORS[index] }}>
                              {stats.avgLatency.toFixed(0)}ms
                            </p>
                            <p className="text-xs text-gray-500">{(stats.successRate * 100).toFixed(1)}% success</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart size={20} />
                      Traffic Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={Object.values(metrics.variantStats).map((stats, index) => ({
                            name: stats.variantName,
                            value: stats.executions,
                            color: COLORS[index]
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {Object.values(metrics.variantStats).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 size={20} />
                      Latency Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={Object.values(metrics.variantStats)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="variantName" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="avgLatency" fill="#3b82f6" name="Avg Latency (ms)" />
                        <Bar dataKey="p95Latency" fill="#8b5cf6" name="P95 Latency (ms)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {metrics.timeSeriesData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity size={20} />
                      Performance Over Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={metrics.timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="timestamp"
                          tickFormatter={value => new Date(value).toLocaleTimeString()}
                        />
                        <YAxis />
                        <Tooltip labelFormatter={value => new Date(value).toLocaleString()} />
                        <Legend />
                        {selectedTest.variants.map((variant, index) => (
                          <Line
                            key={variant.id}
                            type="monotone"
                            dataKey={`variantData.${variant.id}.avgLatency`}
                            stroke={COLORS[index]}
                            name={`${variant.name} Latency`}
                            strokeWidth={2}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="enhanced" className="space-y-6">
              <EnhancedMetricsPanel metrics={metrics} test={selectedTest} />
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.values(metrics.variantStats).map((stats, index) => (
                  <motion.div
                    key={stats.variantId}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card className="border-2" style={{ borderColor: COLORS[index] }}>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                          {stats.variantName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{stats.executions}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Runs</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {(stats.successRate * 100).toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                              {(stats.errorRate * 100).toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Error Rate</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {stats.avgLatency.toFixed(0)}ms
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Latency</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="logs">
              <ExecutionLogsTable executions={executions} />
            </TabsContent>

            <TabsContent value="timeline">
              <ExecutionTimeline executions={executions} />
            </TabsContent>
          </Tabs>
        ) : (
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
      </div>

      {showCreator && (
        <ApiABTestCreator
          testToEdit={testToEdit}
          onClose={handleCloseCreator}
          onSave={handleSaveTest}
        />
      )}
    </div>
  );
};

const EnhancedMetricsPanel: React.FC<{ metrics: ApiABTestMetrics; test: ApiABTest }> = ({ metrics, test }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} />
              Latency Percentiles
            </CardTitle>
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
                  {Object.values(metrics.variantStats).map((stats, index) => (
                    <tr key={stats.variantId} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 px-4 font-medium flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                        {stats.variantName}
                      </td>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap size={20} />
              Throughput Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.values(metrics.variantStats).map((stats, index) => (
                <div key={stats.variantId} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="font-semibold">{stats.variantName}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-green-600">{stats.throughput.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">RPS</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-blue-600">{stats.executions}</div>
                      <div className="text-xs text-gray-500">Total Requests</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-purple-600">{stats.avgLatency.toFixed(0)}ms</div>
                      <div className="text-xs text-gray-500">Avg Latency</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={20} />
            Success Rate Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.values(metrics.variantStats).map((stats, index) => (
              <div key={stats.variantId}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    {stats.variantName}
                  </span>
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

      {metrics.statusCodeDistribution && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={20} />
              Status Code Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(metrics.statusCodeDistribution).map(([variantId, codes], index) => {
                const stats = metrics.variantStats[variantId];
                return (
                  <div key={variantId}>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                      {stats?.variantName}
                    </h4>
                    <div className="space-y-2">
                      {codes.map(({ code, count, percentage }) => (
                        <div key={code} className="flex items-center justify-between text-sm">
                          <span
                            className={`px-2 py-1 rounded ${
                              code === 200
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                            }`}
                          >
                            {code}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 dark:text-gray-400">{count} requests</span>
                            <span className="font-medium">{percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const ExecutionLogsTable: React.FC<{ executions: ApiABTestExecution[] }> = ({ executions }) => {
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());

  const toggleRow = (execId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(execId)) {
      newExpanded.delete(execId);
    } else {
      newExpanded.add(execId);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Logs with Payloads</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-4 w-8"></th>
                <th className="text-left py-2 px-4">Timestamp</th>
                <th className="text-left py-2 px-4">Variant</th>
                <th className="text-left py-2 px-4">Status</th>
                <th className="text-right py-2 px-4">Latency</th>
                <th className="text-right py-2 px-4">Status Code</th>
              </tr>
            </thead>
            <tbody>
              {executions.slice(0, 100).map(exec => (
                <React.Fragment key={exec.id}>
                  <tr
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => toggleRow(exec.id)}
                  >
                    <td className="py-2 px-4">
                      <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        {expandedRows.has(exec.id) ? '▼' : '▶'}
                      </button>
                    </td>
                    <td className="py-2 px-4">{new Date(exec.timestamp).toLocaleString()}</td>
                    <td className="py-2 px-4">{exec.variantName}</td>
                    <td className="py-2 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          exec.status === 'success'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                        }`}
                      >
                        {exec.status}
                      </span>
                    </td>
                    <td className="text-right py-2 px-4">{exec.latencyMs}ms</td>
                    <td className="text-right py-2 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          exec.statusCode === 200
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                        }`}
                      >
                        {exec.statusCode}
                      </span>
                    </td>
                  </tr>
                  {expandedRows.has(exec.id) && (
                    <tr className="bg-gray-50 dark:bg-gray-900">
                      <td colSpan={6} className="py-4 px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                              <span className="text-blue-500">→</span> Request Payload
                            </div>
                            <pre className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto text-xs">
                              {JSON.stringify(exec.requestPayload, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                              <span className="text-green-500">←</span> Response Payload
                            </div>
                            <pre className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto text-xs">
                              {JSON.stringify(exec.responsePayload, null, 2)}
                            </pre>
                            {exec.errorMessage && (
                              <div className="mt-2">
                                <div className="font-semibold text-red-600 dark:text-red-400 mb-1">Error Message</div>
                                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-red-700 dark:text-red-400 text-xs">
                                  {exec.errorMessage}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Showing {Math.min(100, executions.length)} of {executions.length} executions. Click any row to view request/response details.
        </div>
      </CardContent>
    </Card>
  );
};

const ExecutionTimeline: React.FC<{ executions: ApiABTestExecution[] }> = ({ executions }) => {
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  const toggleItem = (execId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(execId)) {
      newExpanded.delete(execId);
    } else {
      newExpanded.add(execId);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Timeline with Payloads</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {executions.slice(0, 50).map((exec, index) => (
            <motion.div
              key={exec.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              className="flex items-start gap-4"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full ${
                    exec.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                {index < executions.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
                )}
              </div>
              <div className="flex-1 pb-8">
                <div
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg -m-2"
                  onClick={() => toggleItem(exec.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{exec.variantName}</span>
                      <button className="text-xs text-gray-500">
                        {expandedItems.has(exec.id) ? '▼' : '▶'}
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(exec.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>Latency: {exec.latencyMs}ms</span>
                    <span>Status: {exec.statusCode}</span>
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${
                        exec.status === 'success'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                      }`}
                    >
                      {exec.status}
                    </span>
                  </div>
                </div>
                {expandedItems.has(exec.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 space-y-3"
                  >
                    <div>
                      <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                        <span className="text-blue-500">→</span> Request
                      </div>
                      <pre className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto text-xs">
                        {JSON.stringify(exec.requestPayload, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                        <span className="text-green-500">←</span> Response
                      </div>
                      <pre className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto text-xs">
                        {JSON.stringify(exec.responsePayload, null, 2)}
                      </pre>
                    </div>
                    {exec.errorMessage && (
                      <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-red-700 dark:text-red-400 text-xs">
                        <span className="font-semibold">Error:</span> {exec.errorMessage}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
