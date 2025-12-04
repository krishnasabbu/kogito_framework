import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useChampionChallengeStore } from '../../stores/championChallengeStore';
import { championChallengeService } from '../../services/championChallengeService';
import { PlayCircle, Loader2, FileCode } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExecutionCreatorProps {
  onExecutionCreated: (executionId: string) => void;
  onCancel: () => void;
}

export const ExecutionCreator: React.FC<ExecutionCreatorProps> = ({
  onExecutionCreated,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [championApiUrl, setChampionApiUrl] = useState('');
  const [challengeApiUrl, setChallengeApiUrl] = useState('');
  const [requestPayload, setRequestPayload] = useState('{\n  "userId": "123",\n  "action": "process"\n}');
  const [isExecuting, setIsExecuting] = useState(false);

  const { addExecution, updateExecution } = useChampionChallengeStore();

  const validateJson = (json: string): boolean => {
    try {
      JSON.parse(json);
      return true;
    } catch {
      return false;
    }
  };

  const handleExecute = async () => {
    if (!name.trim()) {
      toast.error('Please enter a comparison name');
      return;
    }

    if (!championApiUrl.trim() || !challengeApiUrl.trim()) {
      toast.error('Please enter both champion and challenge API URLs');
      return;
    }

    try {
      new URL(championApiUrl);
      new URL(challengeApiUrl);
    } catch {
      toast.error('Please enter valid API URLs');
      return;
    }

    if (!validateJson(requestPayload)) {
      toast.error('Invalid JSON in request payload');
      return;
    }

    setIsExecuting(true);
    const loadingToast = toast.loading('Executing champion vs challenge comparison...');

    try {
      const execution = await championChallengeService.executeComparison(
        championApiUrl,
        challengeApiUrl,
        JSON.parse(requestPayload),
        name,
        description
      );

      addExecution(execution);
      toast.dismiss(loadingToast);
      toast.success('Comparison created successfully!');

      setTimeout(() => {
        toast.success('Execution completed! View results now.');
      }, 2500);

      onExecutionCreated(execution.id);
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(`Execution failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Create New Comparison</h2>
          <p className="text-gray-600">
            Execute both champion and challenge workflows simultaneously to compare
            performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="font-semibold">
                Comparison Name *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Payment Flow Optimization Test"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description of this comparison"
                className="w-full mt-1 px-3 py-2 border rounded-md resize-none h-24"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="champion" className="font-semibold flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                Champion API URL *
              </Label>
              <Input
                id="champion"
                type="url"
                value={championApiUrl}
                onChange={(e) => setChampionApiUrl(e.target.value)}
                placeholder="https://api.example.com/v1/process"
                className="mt-1 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                The current/production API endpoint
              </p>
            </div>

            <div>
              <Label htmlFor="challenge" className="font-semibold flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                Challenge API URL *
              </Label>
              <Input
                id="challenge"
                type="url"
                value={challengeApiUrl}
                onChange={(e) => setChallengeApiUrl(e.target.value)}
                placeholder="https://api.example.com/v2/process"
                className="mt-1 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                The new/experimental API endpoint to test
              </p>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="payload" className="font-semibold flex items-center gap-2">
            <FileCode className="w-4 h-4" />
            Request Payload *
          </Label>
          <p className="text-sm text-gray-600 mb-2">
            JSON payload sent to both workflows
          </p>
          <textarea
            id="payload"
            value={requestPayload}
            onChange={(e) => setRequestPayload(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-md font-mono text-sm resize-none h-48 bg-gray-50"
            spellCheck={false}
          />
          {!validateJson(requestPayload) && requestPayload && (
            <p className="text-sm text-red-600 mt-1">Invalid JSON format</p>
          )}
        </div>

        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-400">How it works:</h4>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li>• Both APIs execute simultaneously with identical request payload</li>
            <li>• Performance metrics collected: latency, response time, status codes</li>
            <li>• Compare responses side-by-side with detailed analysis</li>
            <li>• View request/response payloads and apply filters for deep insights</li>
          </ul>
        </Card>

        <div className="flex items-center gap-3 pt-4 border-t">
          <Button
            onClick={handleExecute}
            disabled={isExecuting}
            className="flex-1 bg-gradient-to-r from-wells-red to-wells-gold hover:from-wells-red-hover hover:to-wells-gold"
            size="lg"
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <PlayCircle className="w-5 h-5 mr-2" />
                Execute Comparison
              </>
            )}
          </Button>
          <Button onClick={onCancel} variant="outline" size="lg" disabled={isExecuting}>
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
};
