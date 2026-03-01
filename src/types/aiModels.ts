/** @file AI Model Types and Constants
 * 
 * Defines the available AI models for LuidGPT multi-model support.
 */

export type AIModel = 
  | 'auto' 
  | 'gpt-4.1' 
  | 'claude-3.5-sonnet' 
  | 'claude-3-opus' 
  | 'gemini-1.5-pro';

export interface AIModelConfig {
  id: AIModel;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'auto';
  description: string;
  strengths: string[];
  icon: string;
  color: string;
  // Token cost per 1K tokens (input + output average)
  costPer1KTokens: number;
}

export const AI_MODELS: AIModelConfig[] = [
  {
    id: 'auto',
    name: 'Auto',
    provider: 'auto',
    description: 'Automatically selects the best model for your task',
    strengths: ['Adaptive', 'Cost-effective', 'Task-optimized'],
    icon: 'Sparkles',
    color: '#8B5CF6', // Purple
    costPer1KTokens: 0,
  },
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    provider: 'openai',
    description: 'Best for code generation and structured outputs',
    strengths: ['Code generation', 'Structured outputs', 'Technical tasks'],
    icon: 'Code',
    color: '#10A37F', // OpenAI green
    costPer1KTokens: 0.03,
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: 'Excellent for writing, analysis, and creative tasks',
    strengths: ['Writing', 'Analysis', 'Creative tasks', 'Long context'],
    icon: 'Pen',
    color: '#D97757', // Anthropic orange
    costPer1KTokens: 0.015,
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    description: 'Most capable for complex reasoning and deep analysis',
    strengths: ['Complex reasoning', 'Deep analysis', 'Research', 'Math'],
    icon: 'Brain',
    color: '#B85C41', // Darker orange
    costPer1KTokens: 0.075,
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    description: 'Best for reasoning and multimodal tasks',
    strengths: ['Reasoning', 'Multimodal', 'Long context', 'Fast'],
    icon: 'Zap',
    color: '#4285F4', // Google blue
    costPer1KTokens: 0.0125,
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
  'code': 'gpt-4.1',
  'coding': 'gpt-4.1',
  'technical': 'gpt-4.1',
  'writing': 'claude-3.5-sonnet',
  'analysis': 'claude-3-opus',
  'research': 'gemini-1.5-pro',
  'reasoning': 'gemini-1.5-pro',
  'general': 'claude-3.5-sonnet',
};

export function getRecommendedModel(taskType?: string): AIModel {
  if (!taskType) return 'auto';
  return TASK_TYPE_MODEL_MAP[taskType.toLowerCase()] || 'auto';
}

// Cost calculation helpers
export function estimateCost(tokens: number, model: AIModel): number {
  if (model === 'auto') return 0;
  const config = getModelConfig(model);
  return (tokens / 1000) * config.costPer1KTokens;
}

export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return '< $0.01';
  }
  return `$${cost.toFixed(2)}`;
}
