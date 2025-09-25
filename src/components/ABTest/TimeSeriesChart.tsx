import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TimeSeriesPoint } from '../../types/abtest';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { format } from 'date-fns';

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
  title: string;
  chartType?: 'line' | 'area';
  showSuccess?: boolean;
}

export default function TimeSeriesChart({ data, title, chartType = 'line', showSuccess = false }: TimeSeriesChartProps) {
  const formatXAxisLabel = (tickItem: string) => {
    return format(new Date(tickItem), 'HH:mm');
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            {format(new Date(label), 'MMM d, HH:mm')}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              {entry.name.includes('Duration') && 'ms'}
              {entry.name.includes('Rate') && '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const ChartComponent = chartType === 'area' ? AreaChart : LineChart;
  const DataComponent = chartType === 'area' ? Area : Line;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ChartComponent data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatXAxisLabel}
                stroke="#6B7280"
                fontSize={12}
                tick={{ fill: '#6B7280' }}
              />
              <YAxis stroke="#6B7280" fontSize={12} tick={{ fill: '#6B7280' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Requests Lines/Areas */}
              <DataComponent
                type="monotone" 
                dataKey="aRequests" 
                stroke="#3B82F6" 
                fill={chartType === 'area' ? "#3B82F6" : undefined}
                fillOpacity={chartType === 'area' ? 0.3 : undefined}
                strokeWidth={2}
                name="Arm A Requests"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
              <DataComponent
                type="monotone" 
                dataKey="bRequests" 
                stroke="#10B981" 
                fill={chartType === 'area' ? "#10B981" : undefined}
                fillOpacity={chartType === 'area' ? 0.2 : undefined}
                strokeWidth={2}
                name="Arm B Requests"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
              
              {/* Success Lines/Areas */}
              {showSuccess && (
                <>
                  <DataComponent
                    type="monotone" 
                    dataKey="aSuccess" 
                    stroke="#8B5CF6" 
                    fill={chartType === 'area' ? "#8B5CF6" : undefined}
                    fillOpacity={chartType === 'area' ? 0.2 : undefined}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Arm A Success"
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 3 }}
                  />
                  <DataComponent
                    type="monotone" 
                    dataKey="bSuccess" 
                    stroke="#F59E0B" 
                    fill={chartType === 'area' ? "#F59E0B" : undefined}
                    fillOpacity={chartType === 'area' ? 0.15 : undefined}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Arm B Success"
                    dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
                  />
                </>
              )}
              
              {/* Average Duration Lines */}
              <DataComponent
                type="monotone" 
                dataKey="aAvgDuration" 
                stroke="#EF4444" 
                fill={chartType === 'area' ? "#EF4444" : undefined}
                fillOpacity={chartType === 'area' ? 0.1 : undefined}
                strokeWidth={2}
                strokeDasharray="3 3"
                name="Arm A Avg Duration"
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 2 }}
              />
              <DataComponent
                type="monotone" 
                dataKey="bAvgDuration" 
                stroke="#F97316" 
                fill={chartType === 'area' ? "#F97316" : undefined}
                fillOpacity={chartType === 'area' ? 0.1 : undefined}
                strokeWidth={2}
                strokeDasharray="3 3"
                name="Arm B Avg Duration"
                dot={{ fill: '#F97316', strokeWidth: 2, r: 2 }}
              />
            </ChartComponent>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}