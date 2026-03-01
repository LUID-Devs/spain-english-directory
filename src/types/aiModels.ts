/**
 * AI Model Types and Constants
 * 
 * Defines the available AI models for LuidGPT multi-model support.
 */

export type AIModel = 'gpt-4o' | 'claude-3-5-sonnet' | 'gemini-1-5-pro' | 'auto';

export interface AIModelConfig {
  id: AIModel;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'auto';
  description: string;
  strengths: string[];
  icon: string;
  color: string;
}

export const AI_MODELS: AIModelConfig[] = [
  {
    id: 'auto',
    name: 'Auto',
    provider: 'auto',
    description: 'Automatically selects the best model for your task',
    strengths: ['Adaptive', 'Cost-effective', 'Optimal performance'],
    icon: 'Sparkles',
    color: '#8B5CF6', // Purple
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'OpenAI\'s flagship model for complex tasks',
    strengths: ['Creative writing', 'Analysis', 'General tasks'],
    icon: 'Brain',
    color: '#10A37F', // OpenAI green
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: 'Anthropic\'s balanced model for coding and reasoning',
    strengths: ['Coding', 'Reasoning', 'Long context'],
    icon: 'Code',
    color: '#D97757', // Anthropic orange
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    description: 'Google\'s model with extensive context window',
    strengths: ['Large context', 'Multimodal', 'Research'],
    icon: 'Zap',
    color: '#4285F4', // Google blue
  },
];

export const DEFAULT_MODEL: AIModel = 'auto';

export function getModelConfig(modelId: AIModel): AIModelConfig {
  return AI_MODELS.find(m => m.id === modelId) || AI_MODELS[0];
}

export function getModelByProvider(provider: string): AIModelConfig | undefined {
  return AI_MODELS.find(m => m.provider === provider);
}

// Task type to model mapping for Auto mode
export const TASK_TYPE_MODEL_MAP: Record<string, AIModel> = {
  'coding': 'claude-3-5-sonnet',
  'analysis': 'gpt-4o',
  'creative': 'gpt-4o',
  'research': 'gemini-1-5-pro',
  'general': 'auto',
};

export function getRecommendedModel(taskType?: string): AIModel {
  if (!taskType) return 'auto';
  return TASK_TYPE_MODEL_MAP[taskType.toLowerCase()] || 'auto';
}
