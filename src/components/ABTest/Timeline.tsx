import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { ExecutionLog } from '../../types/abtest';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { format } from 'date-fns';

interface TimelineProps {
  logs: ExecutionLog[];
  title: string;
}

export default function Timeline({ logs, title }: TimelineProps) {
  const recentLogs = logs.slice(0, 20);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'error':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-yellow-500" />;
    }
  };

  const getOptionColor = (option: 'A' | 'B') => {
    return option === 'A' ? 'border-blue-500' : 'border-green-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentLogs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={`flex items-start gap-4 p-4 border-l-4 ${getOptionColor(log.option)} bg-gray-50 dark:bg-gray-800/50 rounded-r-lg`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(log.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      log.option === 'A' 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    }`}>
                      Option {log.option}
                    </span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                      {log.id.substring(0, 8)}...
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {log.serviceName && (
                      <span className="font-medium">{log.serviceName}</span>
                    )}
                    {log.serviceName && ' • '}
                    <span>{log.duration}ms</span>
                    {log.status === 'error' && log.errorMessage && (
                      <>
                        {' • '}
                        <span className="text-red-600 dark:text-red-400">{log.errorMessage}</span>
                      </>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {recentLogs.length === 0 && (
              <div className="text-center py-8">
                <Clock size={32} className="mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">No recent executions</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}