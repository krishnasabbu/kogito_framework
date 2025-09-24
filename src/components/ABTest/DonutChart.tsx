import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface DonutChartProps {
  optionAPercentage: number;
  optionBPercentage: number;
  optionAName: string;
  optionBName: string;
  title: string;
}

export default function DonutChart({ 
  optionAPercentage, 
  optionBPercentage, 
  optionAName, 
  optionBName, 
  title 
}: DonutChartProps) {
  const data = [
    { name: optionAName, value: optionAPercentage, color: '#3B82F6' },
    { name: optionBName, value: optionBPercentage, color: '#10B981' }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {data.name}: {data.value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {optionAPercentage}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{optionAName}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {optionBPercentage}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{optionBName}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}