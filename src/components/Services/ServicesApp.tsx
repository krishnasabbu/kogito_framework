import React from 'react';
import ServicesDashboard from './ServicesDashboard';

export default function ServicesApp() {

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <ServicesDashboard />
      </div>
    </div>
  );
}