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
  className="h-full"
>
  <div className="card-hover p-6 flex flex-col h-full">
    {/* Header */}
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-1 truncate">
          {test.name}
        </h3>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary line-clamp-2">
          Traffic Split: {test.trafficSplit}% / {100 - test.trafficSplit}%
        </p>
      </div>

      <span
        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(test.status)} flex items-center gap-1`}
      >
        {getStatusIcon(test.status)}
        {test.status.toUpperCase()}
      </span>
    </div>

    {/* Info Section */}
    <div className="space-y-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
      <div className="flex items-center gap-2">
        <Calendar size={14} />
        <span>{format(new Date(test.updatedAt), 'MMM d, yyyy')}</span>
      </div>
      <div className="flex items-center gap-2">
        <span>{test.arms[0]?.armName || 'First Arm'}</span> / <span>{test.arms[1]?.armName || 'Second Arm'}</span>
      </div>
      <div className="flex items-center gap-2">
        <span>v1.0.0</span>
      </div>
    </div>

    {/* Tags / Labels */}
    <div className="flex flex-wrap gap-2 mt-4 mb-4">
      {test.arms.map((arm, index) => (
        <span
          key={arm.armKey}
          className={`px-2 py-1 text-xs rounded-full border ${
            index === 0 
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800'
              : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800'
          }`}
        >
          {arm.armName}
        </span>
      ))}
      <span className="px-2 py-1 text-xs bg-light-surface dark:bg-dark-surface-alt text-light-text-secondary dark:text-dark-text-secondary rounded-full border border-light-border dark:border-dark-border">
        {test.generateListener ? 'Listener' : 'Manual'}
      </span>
    </div>

    {/* BPMN Files (scrollable) */}
    <div className="flex-1 overflow-auto space-y-3 mb-4">
      {test.arms.map((arm, index) => (
        <div
          key={arm.armKey}
          className={`p-3 rounded-lg border ${
            index === 0
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          }`}
        >
          <div className={`text-xs font-medium mb-1 ${
            index === 0 
              ? 'text-blue-800 dark:text-blue-300'
              : 'text-green-800 dark:text-green-300'
          }`}>
            {arm.armName}
          </div>
          <div className={`text-sm font-mono truncate ${
            index === 0
              ? 'text-blue-700 dark:text-blue-400'
              : 'text-green-700 dark:text-green-400'
          }`}>
            {arm.bpmnFile}
          </div>
        </div>
      ))}
    </div>

    {/* Actions */}
    <div className="flex items-center gap-2 mt-auto">
      <button
        onClick={() => onView(test)}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-hover dark:hover:bg-dark-hover rounded-lg transition-all duration-200 hover:scale-105 flex-1"
      >
        <BarChart3 size={14} />
        View Dashboard
      </button>

      <button
        onClick={() => onToggleStatus(test)}
        className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 ${
          test.status === 'running'
            ? 'text-white bg-red-500 hover:bg-red-600'
            : 'text-white bg-green-600 hover:bg-green-700'
        }`}
      >
        {test.status === 'running' ? (
          <>
            <Square size={14} />
            Stop
          </>
        ) : (
          <>
            <Play size={14} />
            Start
          </>
        )}
      </button>
    </div>
  </div>
</motion.div>



  );
}