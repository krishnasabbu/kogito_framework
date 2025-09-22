import React from 'react';
import ServicesDashboard from './ServicesDashboard';

export default function ServicesApp() {

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <ServicesDashboard />
      </div>
    </div>
  );
}