import { api } from './api';

export interface AIMatchResult {
  confidence: number;
  matches: Array<{
    id: number;
    similarity: number;
    matchedFields: string[];
  }>;
}

export interface ImportResult {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
}

export const toolsService = {
  // Find potential matches using AI
  findMatches: async (entityType: string, data: Record<string, any>): Promise<AIMatchResult> => {
    const response = await api.post(`/ai/match/${entityType}`, data);
    return response.data;
  },

  // Import data with AI matching
  importData: async (entityType: string, file: File): Promise<ImportResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/import/${entityType}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Get merge suggestions from AI
  getMergeSuggestions: async (entityType: string, ids: number[]): Promise<AIMatchResult> => {
    const response = await api.post(`/ai/merge-suggestions/${entityType}`, { ids });
    return response.data;
  },

  // Execute merge with AI assistance
  executeMerge: async (entityType: string, targetId: number, sourceIds: number[]): Promise<void> => {
    await api.post(`/merge/${entityType}`, {
      targetId,
      sourceIds,
    });
  },
}; 