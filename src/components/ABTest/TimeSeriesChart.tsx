import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TimeSeriesPoint } from '../../types/abtest';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { format } from 'date-fns';

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
  title: string;
}

export default function TimeSeriesChart({ data, title }: TimeSeriesChartProps) {
  const formatXAxisLabel = (tickItem: string) => {
    return format(new Date(tickItem), 'HH:mm');
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            {format(new Date(label), 'MMM d, HH:mm')}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-white">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatXAxisLabel}
                stroke="#6B7280"
                fontSize={12}
              />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="optionARequests" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Option A Requests"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="optionBRequests" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Option B Requests"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="optionASuccess" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Option A Success"
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="optionBSuccess" 
                stroke="#F59E0B" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Option B Success"
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}