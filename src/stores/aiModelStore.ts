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
}

interface AIModelState extends AIModelPreferences {
  // Actions
  setDefaultModel: (model: AIModel) => void;
  setWorkspaceModel: (workspaceId: number, model: AIModel) => void;
  setChatModel: (chatId: string, model: AIModel) => void;
  getEffectiveModel: (workspaceId?: number, chatId?: string) => AIModel;
  toggleModelIndicator: () => void;
  setAutoModeEnabled: (enabled: boolean) => void;
  setPreferredFallbackModel: (model: AIModel) => void;
  resetWorkspaceModel: (workspaceId: number) => void;
  resetChatModel: (chatId: string) => void;
  resetAllPreferences: () => void;
}

const initialPreferences: AIModelPreferences = {
  defaultModel: DEFAULT_MODEL,
  workspaceModels: {},
  chatModels: {},
  showModelIndicator: true,
  autoModeEnabled: true,
  preferredFallbackModel: 'gpt-4o',
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

      toggleModelIndicator: () => {
        set((state) => ({
          showModelIndicator: !state.showModelIndicator,
        }));
      },

      setAutoModeEnabled: (enabled) => {
        set({ autoModeEnabled: enabled });
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
    }),
    {
      name: 'ai-model-preferences',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Migration from version 0 to version 1
        if (version === 0) {
          // Ensure all model IDs are valid, reset to default if invalid
          const validModels: AIModel[] = ['gpt-4o', 'claude-3-5-sonnet', 'gemini-1-5-pro', 'auto'];
          
          if (persistedState.defaultModel && !validModels.includes(persistedState.defaultModel)) {
            persistedState.defaultModel = DEFAULT_MODEL;
          }
          
          if (persistedState.preferredFallbackModel && !validModels.includes(persistedState.preferredFallbackModel)) {
            persistedState.preferredFallbackModel = 'gpt-4o';
          }
          
          // Clean up workspace models
          if (persistedState.workspaceModels) {
            Object.keys(persistedState.workspaceModels).forEach((key) => {
              if (!validModels.includes(persistedState.workspaceModels[key])) {
                delete persistedState.workspaceModels[key];
              }
            });
          }
          
          // Clean up chat models
          if (persistedState.chatModels) {
            Object.keys(persistedState.chatModels).forEach((key) => {
              if (!validModels.includes(persistedState.chatModels[key])) {
                delete persistedState.chatModels[key];
              }
            });
          }
        }
        return persistedState as AIModelPreferences;
      },
      partialize: (state) => ({
        defaultModel: state.defaultModel,
        workspaceModels: state.workspaceModels,
        chatModels: state.chatModels,
        showModelIndicator: state.showModelIndicator,
        autoModeEnabled: state.autoModeEnabled,
        preferredFallbackModel: state.preferredFallbackModel,
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
