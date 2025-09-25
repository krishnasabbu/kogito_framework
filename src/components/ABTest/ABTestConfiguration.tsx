import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import BpmnFileSelector from './BpmnFileSelector';
import { useABTests } from '../../hooks/useABTests';
import { ABTestArm } from '../../types/abtest';
import toast from 'react-hot-toast';

type ConfigStep = 'basic' | 'files' | 'traffic' | 'review';

export default function ABTestConfiguration() {
  const navigate = useNavigate();
  const { createTest } = useABTests();
  
  const [currentStep, setCurrentStep] = useState<ConfigStep>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    springProjectPath: '/home/project/spring-boot-app',
    trafficSplit: 50,
    generateListener: true
  });

  const [selectedArms, setSelectedArms] = useState<ABTestArm[]>([]);

  const steps: { key: ConfigStep; title: string; description: string }[] = [
    { key: 'basic', title: 'Basic Information', description: 'Test name and description' },
    { key: 'files', title: 'Select BPMN Files', description: 'Choose files from your project' },
    { key: 'traffic', title: 'Traffic Split', description: 'Configure traffic distribution' },
    { key: 'review', title: 'Review & Create', description: 'Review and create the test' }
  ];

  const getCurrentStepIndex = () => steps.findIndex(s => s.key === currentStep);
  const canProceedToNext = () => {
    switch (currentStep) {
      case 'basic':
        return formData.name.trim() !== '';
      case 'files':
        return selectedArms.length >= 2 && 
               selectedArms[0].bpmnFile !== selectedArms[1].bpmnFile;
      case 'traffic':
        return true;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceedToNext()) return;
    
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].key);
    }
  };

  const handlePrevious = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key);
    }
  };

  const handleSubmit = async () => {
    if (!canProceedToNext()) {
      toast.error('Please complete all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createTest({
        ...formData,
        arms: selectedArms,
        status: 'draft'
      });
      
      toast.success('A/B test created successfully');
      navigate('/kogito/ab-tests');
    } catch (error) {
      toast.error('Failed to create A/B test');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800 shadow-xl">
              <CardHeader>
                <CardTitle className="text-blue-900 dark:text-blue-100">Test Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="testName" className="text-blue-800 dark:text-blue-200 font-medium">
                    Test Name *
                  </Label>
                  <Input
                    id="testName"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter A/B test name"
                    className="mt-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-blue-300 dark:border-blue-700"
                  />
                </div>

                <div>
                  <Label htmlFor="testDescription" className="text-blue-800 dark:text-blue-200 font-medium">
                    Description (Optional)
                  </Label>
                  <textarea
                    id="testDescription"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what you're testing and why"
                    rows={3}
                    className="w-full mt-2 px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-blue-300 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'files':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <BpmnFileSelector
              projectPath={formData.springProjectPath}
              selectedArms={selectedArms}
              generateListener={formData.generateListener}
              onArmsChange={setSelectedArms}
              onGenerateListenerChange={(generate) => 
                setFormData(prev => ({ ...prev, generateListener: generate }))
              }
              onProjectPathChange={(path) =>
                setFormData(prev => ({ ...prev, springProjectPath: path }))
              }
            />
          </motion.div>
        );

      case 'traffic':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800 shadow-xl">
              <CardHeader>
                <CardTitle className="text-green-900 dark:text-green-100">Traffic Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-green-800 dark:text-green-200 font-medium">
                      Traffic Split
                    </Label>
                    <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                      {formData.trafficSplit}% / {100 - formData.trafficSplit}%
                    </span>
                  </div>
                  
                  <Slider
                    value={[formData.trafficSplit]}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, trafficSplit: value[0] }))}
                    max={90}
                    min={10}
                    step={5}
                    className="mb-6"
                  />
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {selectedArms[0]?.armName || 'First Arm'}: {formData.trafficSplit}%
                    </span>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      {selectedArms[1]?.armName || 'Second Arm'}: {100 - formData.trafficSplit}%
                    </span>
                  </div>
                </div>

                {/* Visual Preview */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden shadow-inner">
                  <div className="flex h-full">
                    <motion.div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold"
                      initial={{ width: '50%' }}
                      animate={{ width: `${formData.trafficSplit}%` }}
                      transition={{ duration: 0.3 }}
                    >
                      {formData.trafficSplit > 20 && `${formData.trafficSplit}%`}
                    </motion.div>
                    <motion.div 
                      className="bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white text-xs font-bold"
                      initial={{ width: '50%' }}
                      animate={{ width: `${100 - formData.trafficSplit}%` }}
                      transition={{ duration: 0.3 }}
                    >
                      {(100 - formData.trafficSplit) > 20 && `${100 - formData.trafficSplit}%`}
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'review':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800 shadow-xl">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-100">Review Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Test Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-purple-800 dark:text-purple-200 font-medium">Test Name</Label>
                    <p className="text-purple-900 dark:text-purple-100 font-semibold mt-1">{formData.name}</p>
                  </div>
                  
                  {formData.description && (
                    <div>
                      <Label className="text-purple-800 dark:text-purple-200 font-medium">Description</Label>
                      <p className="text-purple-900 dark:text-purple-100 mt-1">{formData.description}</p>
                    </div>
                  )}
                </div>

                {/* Project Path */}
                <div>
                  <Label className="text-purple-800 dark:text-purple-200 font-medium">Project Path</Label>
                  <p className="text-sm font-mono text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900 p-2 rounded mt-1">
                    {formData.springProjectPath}
                  </p>
                </div>

                {/* Test Arms */}
                <div>
                  <Label className="text-purple-800 dark:text-purple-200 font-medium mb-3 block">Test Arms</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedArms.map((arm, index) => (
                      <div
                        key={arm.armKey}
                        className={`p-4 rounded-lg border ${
                          index === 0 
                            ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
                            : 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            index === 0 ? 'bg-blue-500' : 'bg-green-500'
                          }`}>
                            {index + 1}
                          </div>
                          <span className={`font-semibold ${
                            index === 0 
                              ? 'text-blue-800 dark:text-blue-200'
                              : 'text-green-800 dark:text-green-200'
                          }`}>
                            {arm.armName}
                          </span>
                        </div>
                        <p className={`text-xs font-mono ${
                          index === 0
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-green-600 dark:text-green-400'
                        }`}>
                          {arm.bpmnFile}
                        </p>
                        <p className={`text-sm mt-2 ${
                          index === 0
                            ? 'text-blue-700 dark:text-blue-300'
                            : 'text-green-700 dark:text-green-300'
                        }`}>
                          Traffic: {index === 0 ? formData.trafficSplit : 100 - formData.trafficSplit}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Listener Generation */}
                <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} className="text-amber-600" />
                    <span className="font-medium text-amber-800 dark:text-amber-200">
                      Listener Generation: {formData.generateListener ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  {formData.generateListener && (
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      A ProcessEventListener will be generated and injected into your Spring Boot project
                    </p>
                  )}
                </div>

                {/* Ready to Create */}
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800 rounded-xl">
                  <h4 className="font-bold text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                    <CheckCircle size={20} />
                    Ready to Create A/B Test
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your A/B test is configured and ready to be created. Once created, you can start 
                    the test to begin collecting metrics and comparing the performance of your BPMN workflows.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/kogito/ab-tests')}
            className="p-2"
          >
            <ArrowLeft size={20} />
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Create A/B Test
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure a new A/B test to compare BPMN workflow performance
            </p>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-lg transition-all duration-300 ${
                      getCurrentStepIndex() === index
                        ? 'bg-wells-red text-white scale-110'
                        : getCurrentStepIndex() > index
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {getCurrentStepIndex() > index ? (
                      <CheckCircle size={20} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-sm font-medium ${
                      getCurrentStepIndex() >= index 
                        ? 'text-gray-900 dark:text-gray-100' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-24">
                      {step.description}
                    </p>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`w-24 h-1 mx-4 rounded-full transition-all duration-300 ${
                    getCurrentStepIndex() > index 
                      ? 'bg-green-500' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  getCurrentStepIndex() === index 
                    ? 'bg-wells-red scale-125' 
                    : getCurrentStepIndex() > index 
                    ? 'bg-green-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-4">
            {currentStep !== 'basic' && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Previous
              </Button>
            )}

            {currentStep !== 'review' ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canProceedToNext()}
                className="flex items-center gap-2 bg-wells-red hover:bg-red-700"
              >
                Next
                <ArrowRight size={16} />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !canProceedToNext()}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 shadow-lg"
              >
                <Save size={16} />
                {isSubmitting ? 'Creating...' : 'Create A/B Test'}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}