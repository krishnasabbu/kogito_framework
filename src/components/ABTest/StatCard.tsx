import React from 'react';
import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

export default function StatCard({ title, value, change, icon: Icon, color = 'blue' }: StatCardProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return {
          icon: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-100 dark:bg-green-900/30',
          change: change?.type === 'increase' ? 'text-green-600' : 'text-red-600'
        };
      case 'red':
        return {
          icon: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-100 dark:bg-red-900/30',
          change: change?.type === 'decrease' ? 'text-green-600' : 'text-red-600'
        };
      case 'yellow':
        return {
          icon: 'text-yellow-600 dark:text-yellow-400',
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          change: change?.type === 'increase' ? 'text-green-600' : 'text-red-600'
        };
      case 'purple':
        return {
          icon: 'text-purple-600 dark:text-purple-400',
          bg: 'bg-purple-100 dark:bg-purple-900/30',
          change: change?.type === 'increase' ? 'text-green-600' : 'text-red-600'
        };
      default:
        return {
          icon: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          change: change?.type === 'increase' ? 'text-green-600' : 'text-red-600'
        };
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-lg ${colorClasses.bg}`}>
            <Icon className={`h-4 w-4 ${colorClasses.icon}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {change && (
            <p className={`text-xs ${colorClasses.change} mt-1`}>
              {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}% from last period
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}