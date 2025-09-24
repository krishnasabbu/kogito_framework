import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { useABTests } from '../../hooks/useABTests';
import toast from 'react-hot-toast';

export default function ABTestConfiguration() {
  const navigate = useNavigate();
  const { createTest } = useABTests();
  
  const [formData, setFormData] = useState({
    name: '',
    optionA: {
      name: 'Option A',
      bpmnFile: ''
    },
    optionB: {
      name: 'Option B',
      bpmnFile: ''
    },
    trafficSplit: 50
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = (option: 'A' | 'B') => {
    // Mock file selector
    const mockFiles = [
      'order-processing-v1.bpmn',
      'order-processing-v2.bpmn',
      'payment-flow-standard.bpmn',
      'payment-flow-optimized.bpmn',
      'user-onboarding.bpmn',
      'inventory-management.bpmn'
    ];
    
    const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    
    if (option === 'A') {
      setFormData(prev => ({
        ...prev,
        optionA: { ...prev.optionA, bpmnFile: randomFile }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        optionB: { ...prev.optionB, bpmnFile: randomFile }
      }));
    }
    
    toast.success(`Selected ${randomFile} for Option ${option}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Test name is required');
      return;
    }
    
    if (!formData.optionA.bpmnFile || !formData.optionB.bpmnFile) {
      toast.error('Both BPMN files are required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createTest({
        ...formData,
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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
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
              Configure a new A/B test to compare workflow performance
            </p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="testName">Test Name *</Label>
                  <Input
                    id="testName"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter A/B test name"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Workflow Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Workflow Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Option A */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="optionAName">Option A Name</Label>
                      <Input
                        id="optionAName"
                        value={formData.optionA.name}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          optionA: { ...prev.optionA, name: e.target.value }
                        }))}
                        placeholder="Control version"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label>BPMN File *</Label>
                      <div className="mt-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleFileSelect('A')}
                            className="flex items-center gap-2"
                          >
                            <Upload size={16} />
                            Select BPMN File
                          </Button>
                        </div>
                        
                        {formData.optionA.bpmnFile && (
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                              Selected: {formData.optionA.bpmnFile}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Option B */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="optionBName">Option B Name</Label>
                      <Input
                        id="optionBName"
                        value={formData.optionB.name}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          optionB: { ...prev.optionB, name: e.target.value }
                        }))}
                        placeholder="Test version"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label>BPMN File *</Label>
                      <div className="mt-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleFileSelect('B')}
                            className="flex items-center gap-2"
                          >
                            <Upload size={16} />
                            Select BPMN File
                          </Button>
                        </div>
                        
                        {formData.optionB.bpmnFile && (
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <p className="text-sm font-medium text-green-800 dark:text-green-300">
                              Selected: {formData.optionB.bpmnFile}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Traffic Split */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Traffic Split</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Traffic Distribution</Label>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formData.trafficSplit}% / {100 - formData.trafficSplit}%
                    </span>
                  </div>
                  
                  <Slider
                    value={[formData.trafficSplit]}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, trafficSplit: value[0] }))}
                    max={100}
                    min={0}
                    step={5}
                    className="mb-4"
                  />
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      Option A: {formData.optionA.name} ({formData.trafficSplit}%)
                    </span>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      Option B: {formData.optionB.name} ({100 - formData.trafficSplit}%)
                    </span>
                  </div>
                </div>

                {/* Visual Preview */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div className="flex h-full">
                    <motion.div 
                      className="bg-blue-500"
                      initial={{ width: '50%' }}
                      animate={{ width: `${formData.trafficSplit}%` }}
                      transition={{ duration: 0.3 }}
                    />
                    <motion.div 
                      className="bg-green-500"
                      initial={{ width: '50%' }}
                      animate={{ width: `${100 - formData.trafficSplit}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-end gap-4"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/kogito/ab-tests')}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <Save size={16} />
              {isSubmitting ? 'Creating...' : 'Create A/B Test'}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}