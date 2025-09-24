import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import StatCard from './StatCard';
import TimeSeriesChart from './TimeSeriesChart';
import DonutChart from './DonutChart';
import LogsTable from './LogsTable';
import Timeline from './Timeline';
import { useMetrics } from '../../hooks/useMetrics';
import { useLogs } from '../../hooks/useLogs';
import { useABTests } from '../../hooks/useABTests';
import { TimeFilter } from '../../types/abtest';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Timer,
  Activity,
  Target,
  Zap
} from 'lucide-react';

const timeFilters: TimeFilter[] = [
  { label: 'Last 15 minutes', value: '15m', minutes: 15 },
  { label: 'Last 1 hour', value: '1h', minutes: 60 },
  { label: 'Last 6 hours', value: '6h', minutes: 360 },
  { label: 'Last 24 hours', value: '24h', minutes: 1440 },
  { label: 'Last 7 days', value: '7d', minutes: 10080 }
];

export default function ABTestDashboard() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { tests } = useABTests();
  
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<TimeFilter>(timeFilters[3]);
  const { metrics, loading: metricsLoading } = useMetrics(testId!, selectedTimeFilter);
  const { logs, loading: logsLoading } = useLogs(testId!);

  const test = tests.find(t => t.id === testId);

  if (!test) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Test Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The A/B test you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/kogito/ab-tests')}>
            Back to Tests
          </Button>
        </div>
      </div>
    );
  }

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen">
  {/* Header */}
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="border-b border-gray-200 dark:border-gray-700 px-6 py-4"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/kogito/ab-tests')}
          className="p-2"
        >
          <ArrowLeft size={20} />
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {test.name}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>Created {new Date(test.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>Updated {new Date(test.updatedAt).toLocaleDateString()}</span>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              test.status === 'running' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
            }`}>
              {test.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Select value={selectedTimeFilter.value} onValueChange={(value) => {
          const filter = timeFilters.find(f => f.value === value);
          if (filter) setSelectedTimeFilter(filter);
        }}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeFilters.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
          <RefreshCw size={16} />
          Refresh
        </Button>
      </div>
    </div>
  </motion.div>

  {/* Dashboard Content */}
  <div className="p-6">
    {metricsLoading ? (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wells-red mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading metrics...</p>
        </div>
      </div>
    ) : metrics ? (
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="logs">Execution Logs</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Runs"
              value={metrics.totalRuns}
              icon={Activity}
              color="blue"
              change={{ value: 12.5, type: 'increase' }}
            />
            <StatCard
              title="Option A Success Rate"
              value={`${(metrics.optionAStats.successRate * 100).toFixed(1)}%`}
              icon={Target}
              color="green"
              change={{ value: 2.1, type: 'increase' }}
            />
            <StatCard
              title="Option B Success Rate"
              value={`${(metrics.optionBStats.successRate * 100).toFixed(1)}%`}
              icon={Target}
              color="green"
              change={{ value: 5.3, type: 'increase' }}
            />
            <StatCard
              title="Avg Duration Diff"
              value={`${Math.abs(metrics.optionAStats.avgDuration - metrics.optionBStats.avgDuration).toFixed(0)}ms`}
              icon={Timer}
              color="purple"
              change={{ value: 8.7, type: 'decrease' }}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DonutChart
              title="Traffic Distribution"
              optionAPercentage={test.trafficSplit}
              optionBPercentage={100 - test.trafficSplit}
              optionAName={test.optionA.name}
              optionBName={test.optionB.name}
            />
            
            <TimeSeriesChart
              title="Requests Over Time"
              data={metrics.timeSeriesData}
            />
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-8">
          {/* Performance Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    Option A: {test.optionA.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {metrics.optionAStats.runs.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Runs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {(metrics.optionAStats.successRate * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {(metrics.optionAStats.errorRate * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Error Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {metrics.optionAStats.avgDuration.toFixed(0)}ms
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Avg Duration</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Option B: {test.optionB.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {metrics.optionBStats.runs.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Runs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {(metrics.optionBStats.successRate * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {(metrics.optionBStats.errorRate * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Error Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {metrics.optionBStats.avgDuration.toFixed(0)}ms
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Avg Duration</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Service Executions Bar Chart */}
          <div className="mt-8">
            <TimeSeriesChart
              title="Service Execution Trends"
              data={metrics.timeSeriesData}
            />
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <LogsTable logs={logs} title="Execution Logs" testId={testId!} />
        </TabsContent>

        <TabsContent value="timeline">
          <Timeline logs={logs} title="Execution Timeline" />
        </TabsContent>
      </Tabs>
    ) : (
      <div className="text-center py-16">
        <AlertTriangle size={48} className="mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No metrics available
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Metrics will appear once the A/B test starts running.
        </p>
      </div>
    )}
  </div>
</div>

  );
}