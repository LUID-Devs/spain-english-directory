import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIModel, DEFAULT_MODEL, getModelConfig } from '@/types/aiModels';

interface AIModelPreferences {
  // Global default model
  defaultModel: AIModel;
  // Per-workspace model preferences
  workspaceModels: Record<number, AIModel>;
  // Per-chat model preferences (for future chat feature)
  chatModels: Record<string, AIModel>;
  // Whether to show model indicator in UI
  showModelIndicator: boolean;
  // Auto mode settings
  autoModeEnabled: boolean;
  preferredFallbackModel: AIModel;
  // Show cost estimates
  showCostEstimates: boolean;
  // Usage tracking (session-based)
  sessionTokensUsed: number;
  sessionCostEstimate: number;
}

interface AIModelState extends AIModelPreferences {
  // Actions
  setDefaultModel: (model: AIModel) => void;
  setWorkspaceModel: (workspaceId: number, model: AIModel) => void;
  setChatModel: (chatId: string, model: AIModel) => void;
  getEffectiveModel: (workspaceId?: number, chatId?: string) => AIModel;
  toggleModelIndicator: () => void;
  toggleCostEstimates: () => void;
  setPreferredFallbackModel: (model: AIModel) => void;
  resetWorkspaceModel: (workspaceId: number) => void;
  resetChatModel: (chatId: string) => void;
  resetAllPreferences: () => void;
  // Usage tracking
  addUsage: (tokens: number, model?: AIModel) => void;
  resetUsage: () => void;
  getModelForTask: (taskType: string) => AIModel;
}

const initialPreferences: AIModelPreferences = {
  defaultModel: DEFAULT_MODEL,
  workspaceModels: {},
  chatModels: {},
  showModelIndicator: true,
  autoModeEnabled: true,
  preferredFallbackModel: 'claude-3.5-sonnet',
  showCostEstimates: true,
  sessionTokensUsed: 0,
  sessionCostEstimate: 0,
};

export const useAIModelStore = create<AIModelState>()(
  persist(
    (set, get) => ({
      ...initialPreferences,

      setDefaultModel: (model) => {
        set({ defaultModel: model });
      },

      setWorkspaceModel: (workspaceId, model) => {
        set((state) => ({
          workspaceModels: {
            ...state.workspaceModels,
            [workspaceId]: model,
          },
        }));
      },

      setChatModel: (chatId, model) => {
        set((state) => ({
          chatModels: {
            ...state.chatModels,
            [chatId]: model,
          },
        }));
      },

      getEffectiveModel: (workspaceId?, chatId?) => {
        const state = get();
        
        // Priority: chat > workspace > default
        if (chatId && state.chatModels[chatId]) {
          return state.chatModels[chatId];
        }
        
        if (workspaceId && state.workspaceModels[workspaceId]) {
          return state.workspaceModels[workspaceId];
        }
        
        return state.defaultModel;
      },

      getModelForTask: (taskType) => {
        const { defaultModel, autoModeEnabled } = get();
        
        if (autoModeEnabled && (defaultModel === 'auto' || !defaultModel)) {
          const taskModelMap: Record<string, AIModel> = {
            'code': 'gpt-4.1',
            'coding': 'gpt-4.1',
            'technical': 'gpt-4.1',
            'writing': 'claude-3.5-sonnet',
            'analysis': 'claude-3-opus',
            'research': 'gemini-1.5-pro',
            'reasoning': 'gemini-1.5-pro',
            'general': 'claude-3.5-sonnet',
          };
          return taskModelMap[taskType.toLowerCase()] || 'claude-3.5-sonnet';
        }
        
        return defaultModel;
      },

      toggleModelIndicator: () => {
        set((state) => ({
          showModelIndicator: !state.showModelIndicator,
        }));
      },

      toggleCostEstimates: () => {
        set((state) => ({
          showCostEstimates: !state.showCostEstimates,
        }));
      },

      setPreferredFallbackModel: (model) => {
        set({ preferredFallbackModel: model });
      },

      resetWorkspaceModel: (workspaceId) => {
        set((state) => {
          const { [workspaceId]: _, ...rest } = state.workspaceModels;
          return { workspaceModels: rest };
        });
      },

      resetChatModel: (chatId) => {
        set((state) => {
          const { [chatId]: _, ...rest } = state.chatModels;
          return { chatModels: rest };
        });
      },

      resetAllPreferences: () => {
        set(initialPreferences);
      },

      addUsage: (tokens, model) => {
        const { defaultModel, sessionTokensUsed, sessionCostEstimate } = get();
        const modelUsed = model || defaultModel;
        
        let costPer1K = 0;
        if (modelUsed !== 'auto') {
          const config = getModelConfig(modelUsed);
          costPer1K = config.costPer1KTokens || 0;
        }
        const cost = (tokens / 1000) * costPer1K;

        set({
          sessionTokensUsed: sessionTokensUsed + tokens,
          sessionCostEstimate: sessionCostEstimate + cost,
        });
      },

      resetUsage: () => {
        set({
          sessionTokensUsed: 0,
          sessionCostEstimate: 0,
        });
      },
    }),
    {
      name: 'ai-model-preferences',
      partialize: (state) => ({
        defaultModel: state.defaultModel,
        workspaceModels: state.workspaceModels,
        chatModels: state.chatModels,
        showModelIndicator: state.showModelIndicator,
        autoModeEnabled: state.autoModeEnabled,
        preferredFallbackModel: state.preferredFallbackModel,
        showCostEstimates: state.showCostEstimates,
        // Don't persist usage stats - they reset on session
      }),
    }
  )
);

// Helper hooks
export const useSelectedModel = (workspaceId?: number, chatId?: string): AIModel => {
  return useAIModelStore((state) => state.getEffectiveModel(workspaceId, chatId));
};

export const useModelConfig = (workspaceId?: number, chatId?: string) => {
  const model = useSelectedModel(workspaceId, chatId);
  return getModelConfig(model);
};
