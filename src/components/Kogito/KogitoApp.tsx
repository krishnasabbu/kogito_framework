import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import KogitoNavigation from './KogitoNavigation';
import WorkflowList from './WorkflowList';
import WorkflowEditor from './WorkflowEditor';
import ABTestList from './ABTestList';
import ABTestCreator from './ABTestCreator';
import IDEInterface from '../IDE/IDEInterface';
import { useKogitoStore } from '../../stores/kogitoStore';

export default function KogitoApp() {
  const { showABTestCreator } = useKogitoStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 transition-colors">
      <KogitoNavigation />
      
      <main className="container mx-auto px-6 py-8 max-w-7xl min-h-screen">
        <Routes>
          <Route path="/" element={<Navigate to="workflows" replace />} />
          <Route path="workflows" element={<WorkflowList />} />
          <Route path="workflows/new" element={<WorkflowEditor />} />
          <Route path="workflows/:id/edit" element={<WorkflowEditor />} />
          <Route path="workflows/:projectId/run" element={<IDEInterface />} />
          <Route path="ab-tests" element={<ABTestList />} />
        </Routes>
      </main>

      {/* A/B Test Creator Modal */}
      {showABTestCreator && <ABTestCreator />}

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
            border: '1px solid var(--toast-border)',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        }}
      />
    </div>
  );
}