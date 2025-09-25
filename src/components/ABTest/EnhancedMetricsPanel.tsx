import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Zap, 
  Target, 
  AlertTriangle,
  Activity,
  BarChart3,
  PieChart,
  Timer
} from 'lucide-react';
import { ABTestMetrics } from '../../types/abtest';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface EnhancedMetricsPanelProps {
  metrics: ABTestMetrics;
  testName: string;
}

export default function EnhancedMetricsPanel({ metrics, testName }: EnhancedMetricsPanelProps) {
  const armKeys = Object.keys(metrics.armStats);
  const armColors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

  // Prepare data for latency percentiles chart
  const latencyData = [
    {
      percentile: 'P50',
      ...armKeys.reduce((acc, key, index) => ({
        ...acc,
        [key]: metrics.latencyPercentiles.p50[key] || 0
      }), {})
    },
    {
      percentile: 'P90',
      ...armKeys.reduce((acc, key, index) => ({
        ...acc,
        [key]: metrics.latencyPercentiles.p90[key] || 0
      }), {})
    },
    {
      percentile: 'P95',
      ...armKeys.reduce((acc, key, index) => ({
        ...acc,
        [key]: metrics.latencyPercentiles.p95[key] || 0
      }), {})
    },
    {
      percentile: 'P99',
      ...armKeys.reduce((acc, key, index) => ({
        ...acc,
        [key]: metrics.latencyPercentiles.p99[key] || 0
      }), {})
    }
  ];

  // Prepare data for throughput chart
  const throughputData = armKeys.map((key, index) => ({
    arm: metrics.armStats[key].armName,
    rps: metrics.throughputMetrics.rps[key] || 0,
    peakRps: metrics.throughputMetrics.peakRps[key] || 0,
    avgRps: metrics.throughputMetrics.avgRps[key] || 0,
    color: armColors[index]
  }));

  // Prepare data for error breakdown pie chart
  const errorData = metrics.errorBreakdown.map((error, index) => ({
    name: error.errorType,
    value: Object.values(error.count).reduce((sum, count) => sum + count, 0),
    color: armColors[index % armColors.length]
  }));

  // Prepare data for activity performance
  const activityData = metrics.activityPerformance.map(activity => ({
    name: activity.activityName,
    ...armKeys.reduce((acc, key) => ({
      ...acc,
      [`${key}_duration`]: activity.avgDuration[key] || 0,
      [`${key}_errors`]: activity.errorRate[key] * 100 || 0
    }), {})
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl backdrop-blur-sm">
          <p className="font-medium text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
              {entry.name.includes('duration') && 'ms'}
              {entry.name.includes('rate') && '%'}
              {entry.name.includes('rps') && ' req/s'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {armKeys.map((armKey, index) => {
          const stats = metrics.armStats[armKey];
          const color = armColors[index];
          
          return (
            <motion.div
              key={armKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full shadow-lg"
                      style={{ backgroundColor: color }}
                    />
                    {stats.armName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.runs.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Executions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {(stats.successRate * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Success Rate</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {stats.avgDuration.toFixed(0)}ms
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Avg Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">
                        {(stats.errorRate * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Error Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Latency Percentiles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-blue-900 dark:text-blue-100">
              <Clock size={24} className="text-blue-600" />
              Latency Percentiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={latencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="percentile" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {armKeys.map((key, index) => (
                  <Bar 
                    key={key}
                    dataKey={key} 
                    name={metrics.armStats[key].armName}
                    fill={armColors[index]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Throughput Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-green-900 dark:text-green-100">
              <Zap size={24} className="text-green-600" />
              Throughput Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={throughputData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="arm" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="rps" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.3}
                    name="Current RPS"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="peakRps" 
                    stroke="#059669" 
                    fill="#059669" 
                    fillOpacity={0.2}
                    name="Peak RPS"
                  />
                </AreaChart>
              </ResponsiveContainer>

              <div className="space-y-4">
                {armKeys.map((key, index) => {
                  const stats = metrics.armStats[key];
                  const throughput = metrics.throughputMetrics;
                  
                  return (
                    <div
                      key={key}
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: armColors[index] }}
                        />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {stats.armName}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="text-center">
                          <div className="font-bold text-green-600">
                            {throughput.rps[key]?.toFixed(1) || 0}
                          </div>
                          <div className="text-xs text-gray-500">Current RPS</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-blue-600">
                            {throughput.peakRps[key]?.toFixed(1) || 0}
                          </div>
                          <div className="text-xs text-gray-500">Peak RPS</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-purple-600">
                            {throughput.totalRequests[key]?.toLocaleString() || 0}
                          </div>
                          <div className="text-xs text-gray-500">Total Requests</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* SLA Compliance & Concurrency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SLA Metrics */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950 border-red-200 dark:border-red-800 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-red-900 dark:text-red-100">
                <Target size={24} className="text-red-600" />
                SLA Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="text-sm text-red-700 dark:text-red-300 mb-2">
                    SLA Threshold: {metrics.slaMetrics.slaThreshold}ms
                  </div>
                </div>

                {armKeys.map((key, index) => {
                  const stats = metrics.armStats[key];
                  const sla = metrics.slaMetrics;
                  const complianceRate = sla.complianceRate[key] * 100;
                  const breaches = sla.breaches[key];
                  
                  return (
                    <div
                      key={key}
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: armColors[index] }}
                          />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {stats.armName}
                          </span>
                        </div>
                        <span className={`text-sm font-bold ${
                          complianceRate >= 95 ? 'text-green-600' : 
                          complianceRate >= 90 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {complianceRate.toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            complianceRate >= 95 ? 'bg-green-500' :
                            complianceRate >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${complianceRate}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>Breaches: {breaches}</span>
                        <span>Avg: {sla.avgResponseTime[key]?.toFixed(0)}ms</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Concurrency Metrics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border-purple-200 dark:border-purple-800 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-purple-900 dark:text-purple-100">
                <Activity size={24} className="text-purple-600" />
                Concurrency Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {armKeys.map((key, index) => {
                  const stats = metrics.armStats[key];
                  const concurrency = metrics.concurrencyMetrics;
                  
                  return (
                    <div
                      key={key}
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: armColors[index] }}
                        />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {stats.armName}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-xl font-bold text-purple-600">
                            {concurrency.maxConcurrent[key] || 0}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Max Concurrent</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-600">
                            {concurrency.avgConcurrent[key]?.toFixed(1) || 0}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Avg Concurrent</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">
                            {concurrency.queueTime[key]?.toFixed(0) || 0}ms
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Queue Time</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-600">
                            {concurrency.waitTime[key]?.toFixed(0) || 0}ms
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Wait Time</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Error Breakdown */}
      {errorData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-red-200 dark:border-red-800 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-red-900 dark:text-red-100">
                <AlertTriangle size={24} className="text-red-600" />
                Error Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={errorData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {errorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  {metrics.errorBreakdown.map((error, index) => (
                    <div
                      key={error.errorType}
                      className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: armColors[index % armColors.length] }}
                        />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {error.errorType}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {armKeys.map(key => (
                          <div key={key} className="text-center">
                            <div className="font-bold text-gray-900 dark:text-white">
                              {error.count[key] || 0}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {metrics.armStats[key].armName}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Activity Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200 dark:border-indigo-800 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-indigo-900 dark:text-indigo-100">
              <BarChart3 size={24} className="text-indigo-600" />
              Activity Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={activityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {armKeys.map((key, index) => (
                  <Bar 
                    key={`${key}_duration`}
                    dataKey={`${key}_duration`} 
                    name={`${metrics.armStats[key].armName} Duration`}
                    fill={armColors[index]}
                    radius={[2, 2, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Time Series Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950 dark:to-slate-950 border-gray-200 dark:border-gray-800 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
              <Timer size={24} className="text-gray-600" />
              Performance Trends Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={metrics.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#6B7280"
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  content={<CustomTooltip />}
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                />
                <Legend />
                {armKeys.map((key, index) => (
                  <React.Fragment key={key}>
                    <Line 
                      type="monotone" 
                      dataKey={`armData.${key}.requests`}
                      stroke={armColors[index]}
                      strokeWidth={3}
                      name={`${metrics.armStats[key].armName} Requests`}
                      dot={{ fill: armColors[index], strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey={`armData.${key}.avgDuration`}
                      stroke={armColors[index]}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name={`${metrics.armStats[key].armName} Avg Duration`}
                      dot={{ fill: armColors[index], strokeWidth: 2, r: 3 }}
                    />
                  </React.Fragment>
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}