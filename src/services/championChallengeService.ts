import { championChallengeApiService } from './championChallengeApiService';
import type { ChampionChallengeExecution } from '../types/championChallenge';

export class ChampionChallengeService {
  async executeComparison(
    championWorkflowId: string,
    challengeWorkflowId: string,
    requestPayload: any,
    name: string,
    description?: string
  ): Promise<ChampionChallengeExecution> {
    return championChallengeApiService.createExecution(
      name,
      description || '',
      championWorkflowId,
      challengeWorkflowId,
      requestPayload
    );
  }

  async loadExecution(executionId: string): Promise<ChampionChallengeExecution | null> {
    try {
      return await championChallengeApiService.getExecution(executionId);
    } catch (error) {
      console.error('Failed to load execution:', error);
      return null;
    }
  }

  async listExecutions(): Promise<ChampionChallengeExecution[]> {
    try {
      return await championChallengeApiService.listExecutions();
    } catch (error) {
      console.error('Failed to list executions:', error);
      return [];
    }
  }
}

export const championChallengeService = new ChampionChallengeService();
