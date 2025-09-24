import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, BarChart3, Calendar, Users } from 'lucide-react';
import { ABTestConfig } from '../../types/abtest';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { format } from 'date-fns';

interface ABTestCardProps {
  test: ABTestConfig;
  onView: (test: ABTestConfig) => void;
  onToggleStatus: (test: ABTestConfig) => void;
}

export default function ABTestCard({ test, onView, onToggleStatus }: ABTestCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'stopped':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'draft':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
      case 'completed':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play size={14} />;
      case 'stopped':
        return <Square size={14} />;
      case 'draft':
        return <Pause size={14} />;
      default:
        return <BarChart3 size={14} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-80 flex flex-col cursor-pointer hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2 line-clamp-2">{test.name}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar size={14} />
                <span>{format(new Date(test.updatedAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
            
            <span className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(test.status)}`}>
              {getStatusIcon(test.status)}
              {test.status.toUpperCase()}
            </span>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          {/* Traffic Split Visualization */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Traffic Split</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {test.trafficSplit}% / {100 - test.trafficSplit}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div className="flex h-full">
                <div 
                  className="bg-blue-500 transition-all duration-300"
                  style={{ width: `${test.trafficSplit}%` }}
                />
                <div 
                  className="bg-green-500 transition-all duration-300"
                  style={{ width: `${100 - test.trafficSplit}%` }}
                />
              </div>
            </div>
            
            <div className="flex justify-between mt-2 text-xs">
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                Option A: {test.optionA.name}
              </span>
              <span className="text-green-600 dark:text-green-400 font-medium">
                Option B: {test.optionB.name}
              </span>
            </div>
          </div>

          {/* BPMN Files */}
          <div className="space-y-3 mb-6 flex-1">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">Option A</div>
              <div className="text-sm text-blue-700 dark:text-blue-400 font-mono truncate">
                {test.optionA.bpmnFile}
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-xs font-medium text-green-800 dark:text-green-300 mb-1">Option B</div>
              <div className="text-sm text-green-700 dark:text-green-400 font-mono truncate">
                {test.optionB.bpmnFile}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-auto">
            <Button
              onClick={() => onView(test)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <BarChart3 size={14} className="mr-1" />
              View Dashboard
            </Button>
            
            <Button
              onClick={() => onToggleStatus(test)}
              variant={test.status === 'running' ? 'destructive' : 'default'}
              size="sm"
            >
              {test.status === 'running' ? (
                <>
                  <Square size={14} className="mr-1" />
                  Stop
                </>
              ) : (
                <>
                  <Play size={14} className="mr-1" />
                  Start
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}