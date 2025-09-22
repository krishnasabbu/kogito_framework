import React, { useState, useEffect } from 'react';
import { X, Save, BarChart3, Settings, Target } from 'lucide-react';
import { useKogitoStore } from '../../stores/kogitoStore';
import { ABTest, ABTestCriteria } from '../../types/kogito';
import toast from 'react-hot-toast';

export default function ABTestCreator() {
  const {
    workflows,
    currentABTest,
    setCurrentABTest,
    setShowABTestCreator,
    createABTest,
    updateABTest,
    loadWorkflows
  } = useKogitoStore();

  const [activeTab, setActiveTab] = useState<'setup' | 'criteria' | 'review'>('setup');
  const [testData, setTestData] = useState<Partial<ABTest>>({
    name: '',
    description: '',
    workflowAId: '',
    workflowBId: '',
    trafficSplit: 50,
    status: 'draft',
    createdBy: 'current-user',
    criteria: {
      primaryMetric: 'success_rate',
      minimumSampleSize: 100,
      confidenceLevel: 95,
      minimumDetectableEffect: 5,
      maxDurationDays: 30
    }
  });

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  useEffect(() => {
    if (currentABTest) {
      setTestData(currentABTest);
    } else {
      setTestData({
        name: '',
        description: '',
        workflowAId: '',
        workflowBId: '',
        trafficSplit: 50,
        status: 'draft',
        createdBy: 'current-user',
        criteria: {
          primaryMetric: 'success_rate',
          minimumSampleSize: 100,
          confidenceLevel: 95,
          minimumDetectableEffect: 5,
          maxDurationDays: 30
        }
      });
    }
  }, [currentABTest]);

  const handleSave = async () => {
    try {
      if (!testData.name?.trim()) {
        toast.error('Test name is required');
        return;
      }

      if (!testData.workflowAId || !testData.workflowBId) {
        toast.error('Both workflow variants are required');
        return;
      }

      if (testData.workflowAId === testData.workflowBId) {
        toast.error('Workflow variants must be different');
        return;
      }

      if (currentABTest) {
        await updateABTest(currentABTest.id, testData);
        toast.success('A/B test updated successfully');
      } else {
        await createABTest(testData as Omit<ABTest, 'id' | 'metrics'>);
        toast.success('A/B test created successfully');
      }
      
      setShowABTestCreator(false);
    } catch (error) {
      toast.error('Failed to save A/B test');
    }
  };

  const handleClose = () => {
    setCurrentABTest(null);
    setShowABTestCreator(false);
  };

  const getWorkflowName = (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    return workflow ? workflow.name : 'Unknown Workflow';
  };

  const canProceedToNextTab = () => {
    switch (activeTab) {
      case 'setup':
        return testData.name?.trim() && testData.workflowAId && testData.workflowBId && testData.workflowAId !== testData.workflowBId;
      case 'criteria':
        return testData.criteria?.minimumSampleSize && testData.criteria?.confidenceLevel;
      default:
        return true;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-wells-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              {currentABTest ? 'Edit A/B Test' : 'Create A/B Test'}
            </h2>
            <p className="text-text-muted">
              Compare two workflow variants to optimize performance
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!canProceedToNextTab()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              <Save size={16} />
              Save
            </button>

            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('setup')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'setup'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Settings size={16} />
            Setup
          </button>

          <button
            onClick={() => setActiveTab('criteria')}
            disabled={!canProceedToNextTab() && activeTab === 'setup'}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              activeTab === 'criteria'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Target size={16} />
            Success Criteria
          </button>

          <button
            onClick={() => setActiveTab('review')}
            disabled={!canProceedToNextTab()}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              activeTab === 'review'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <BarChart3 size={16} />
            Review
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'setup' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Test Name *
                </label>
                <input
                  type="text"
                  value={testData.name || ''}
                  onChange={(e) => setTestData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter A/B test name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Description
                </label>
                <textarea
                  value={testData.description || ''}
                  onChange={(e) => setTestData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Describe what you're testing and why"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Workflow A (Control) *
                  </label>
                  <select
                    value={testData.workflowAId || ''}
                    onChange={(e) => setTestData(prev => ({ ...prev, workflowAId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select workflow...</option>
                    {workflows.filter(w => w.status === 'active').map(workflow => (
                      <option key={workflow.id} value={workflow.id}>
                        {workflow.name} (v{workflow.version})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Workflow B (Variant) *
                  </label>
                  <select
                    value={testData.workflowBId || ''}
                    onChange={(e) => setTestData(prev => ({ ...prev, workflowBId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select workflow...</option>
                    {workflows.filter(w => w.status === 'active' && w.id !== testData.workflowAId).map(workflow => (
                      <option key={workflow.id} value={workflow.id}>
                        {workflow.name} (v{workflow.version})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Traffic Split
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-text-muted w-20">Workflow A:</span>
                    <div className="flex-1">
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={testData.trafficSplit || 50}
                        onChange={(e) => setTestData(prev => ({ ...prev, trafficSplit: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                    <span className="text-sm font-medium text-text-primary w-12">
                      {testData.trafficSplit}%
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-text-muted w-20">Workflow B:</span>
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-secondary rounded-full"
                          style={{ width: `${100 - (testData.trafficSplit || 50)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-text-primary w-12">
                      {100 - (testData.trafficSplit || 50)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'criteria' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Primary Success Metric
                </label>
                <select
                  value={testData.criteria?.primaryMetric || 'success_rate'}
                  onChange={(e) => setTestData(prev => ({
                    ...prev,
                    criteria: { ...prev.criteria!, primaryMetric: e.target.value as any }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="success_rate">Success Rate</option>
                  <option value="avg_duration">Average Duration</option>
                  <option value="error_rate">Error Rate</option>
                  <option value="custom">Custom Metric</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Minimum Sample Size
                  </label>
                  <input
                    type="number"
                    value={testData.criteria?.minimumSampleSize || 100}
                    onChange={(e) => setTestData(prev => ({
                      ...prev,
                      criteria: { ...prev.criteria!, minimumSampleSize: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Confidence Level (%)
                  </label>
                  <select
                    value={testData.criteria?.confidenceLevel || 95}
                    onChange={(e) => setTestData(prev => ({
                      ...prev,
                      criteria: { ...prev.criteria!, confidenceLevel: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="90">90%</option>
                    <option value="95">95%</option>
                    <option value="99">99%</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Minimum Detectable Effect (%)
                  </label>
                  <input
                    type="number"
                    value={testData.criteria?.minimumDetectableEffect || 5}
                    onChange={(e) => setTestData(prev => ({
                      ...prev,
                      criteria: { ...prev.criteria!, minimumDetectableEffect: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="1"
                    max="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Maximum Duration (Days)
                  </label>
                  <input
                    type="number"
                    value={testData.criteria?.maxDurationDays || 30}
                    onChange={(e) => setTestData(prev => ({
                      ...prev,
                      criteria: { ...prev.criteria!, maxDurationDays: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="1"
                    max="365"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Statistical Power Calculation</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>Based on your criteria, this test will need approximately:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>
                      <strong>{Math.ceil((testData.criteria?.minimumSampleSize || 100) / ((testData.trafficSplit || 50) / 100))}</strong> total executions
                    </li>
                    <li>
                      <strong>{testData.criteria?.confidenceLevel}%</strong> confidence level
                    </li>
                    <li>
                      Ability to detect <strong>{testData.criteria?.minimumDetectableEffect}%</strong> improvement
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'review' && (
            <div className="max-w-2xl space-y-6">
              <div className="bg-surface p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Test Configuration</h3>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-text-muted">Test Name:</span>
                    <p className="text-text-primary">{testData.name}</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-text-muted">Description:</span>
                    <p className="text-text-primary">{testData.description || 'No description provided'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-text-muted">Workflow A (Control):</span>
                      <p className="text-text-primary">{getWorkflowName(testData.workflowAId || '')}</p>
                      <p className="text-sm text-text-muted">{testData.trafficSplit}% traffic</p>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-text-muted">Workflow B (Variant):</span>
                      <p className="text-text-primary">{getWorkflowName(testData.workflowBId || '')}</p>
                      <p className="text-sm text-text-muted">{100 - (testData.trafficSplit || 50)}% traffic</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Success Criteria</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-text-muted">Primary Metric:</span>
                    <p className="text-text-primary capitalize">
                      {testData.criteria?.primaryMetric?.replace('_', ' ')}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-text-muted">Minimum Sample Size:</span>
                    <p className="text-text-primary">{testData.criteria?.minimumSampleSize}</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-text-muted">Confidence Level:</span>
                    <p className="text-text-primary">{testData.criteria?.confidenceLevel}%</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-text-muted">Max Duration:</span>
                    <p className="text-text-primary">{testData.criteria?.maxDurationDays} days</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Ready to Start</h4>
                <p className="text-sm text-yellow-700">
                  Your A/B test is configured and ready to run. Once saved, you can start the test 
                  from the A/B Tests dashboard. Traffic will be automatically split between the two 
                  workflow variants according to your configuration.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="flex items-center gap-2">
            {['setup', 'criteria', 'review'].map((tab, index) => (
              <div
                key={tab}
                className={`w-3 h-3 rounded-full ${
                  activeTab === tab ? 'bg-primary' : 
                  ['setup', 'criteria', 'review'].indexOf(activeTab) > index ? 'bg-success' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            {activeTab !== 'setup' && (
              <button
                onClick={() => {
                  const tabs = ['setup', 'criteria', 'review'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1] as any);
                  }
                }}
                className="px-4 py-2 text-text-primary hover:bg-gray-100 rounded-md transition-colors"
              >
                Previous
              </button>
            )}

            {activeTab !== 'review' && (
              <button
                onClick={() => {
                  const tabs = ['setup', 'criteria', 'review'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex < tabs.length - 1 && canProceedToNextTab()) {
                    setActiveTab(tabs[currentIndex + 1] as any);
                  }
                }}
                disabled={!canProceedToNextTab()}
                className="px-4 py-2 bg-primary text-white hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}