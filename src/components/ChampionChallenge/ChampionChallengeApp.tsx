import React, { useState } from 'react';
import { useChampionChallengeStore } from '../../stores/championChallengeStore';
import { ComparisonDashboard } from './ComparisonDashboard';
import { ExecutionCreator } from './ExecutionCreator';
import { ExecutionList } from './ExecutionList';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Trophy, Plus, List } from 'lucide-react';

type View = 'list' | 'create' | 'dashboard';

export const ChampionChallengeApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(
    null
  );
  const { executions } = useChampionChallengeStore();

  const handleCreateNew = () => {
    setCurrentView('create');
  };

  const handleExecutionCreated = (executionId: string) => {
    setSelectedExecutionId(executionId);
    setCurrentView('dashboard');
  };

  const handleViewExecution = (executionId: string) => {
    setSelectedExecutionId(executionId);
    setCurrentView('dashboard');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedExecutionId(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Champion vs Challenge</h1>
                <p className="text-sm opacity-90">
                  Compare BPMN workflow executions side by side
                </p>
              </div>
            </div>

            {currentView !== 'list' && (
              <Button
                onClick={handleBackToList}
                variant="outline"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <List className="w-4 h-4 mr-2" />
                Back to List
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {currentView === 'list' && (
          <div className="h-full overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Execution History</h2>
                  <p className="text-gray-600 mt-1">
                    View and compare past champion vs challenge runs
                  </p>
                </div>
                <Button
                  onClick={handleCreateNew}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  New Comparison
                </Button>
              </div>

              {executions.length === 0 ? (
                <Card className="p-12 text-center">
                  <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    No Comparisons Yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create your first champion vs challenge comparison to get started
                  </p>
                  <Button
                    onClick={handleCreateNew}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Comparison
                  </Button>
                </Card>
              ) : (
                <ExecutionList
                  executions={executions}
                  onViewExecution={handleViewExecution}
                />
              )}
            </div>
          </div>
        )}

        {currentView === 'create' && (
          <div className="h-full overflow-auto p-6">
            <div className="max-w-4xl mx-auto">
              <ExecutionCreator
                onExecutionCreated={handleExecutionCreated}
                onCancel={handleBackToList}
              />
            </div>
          </div>
        )}

        {currentView === 'dashboard' && selectedExecutionId && (
          <ComparisonDashboard executionId={selectedExecutionId} />
        )}
      </main>
    </div>
  );
};
