import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface DonutChartProps {
  arms: Array<{
    armKey: string;
    armName: string;
    percentage: number;
    color: string;
  }>;
  title: string;
}

export default function DonutChart({ 
  arms,
  title 
}: DonutChartProps) {
  const data = arms.map(arm => ({
    name: arm.armName,
    value: arm.percentage,
    color: arm.color
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
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
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-white">{title}</CardTitle>
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
            {arms.map((arm, index) => (
              <div key={arm.armKey} className="text-center">
                <div className="text-2xl font-bold" style={{ color: arm.color }}>
                  {arm.percentage}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{arm.armName}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}