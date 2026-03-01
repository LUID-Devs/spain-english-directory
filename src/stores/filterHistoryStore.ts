import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FilterHistoryEntry {
  id: string;
  query: string;
  criteria: {
    assignee?: string[];
    status?: string[];
    priority?: string[];
    project?: string[];
    label?: string[];
    due?: string[];
    text?: string;
  };
  filterCount: number;
  wasAIInterpreted: boolean;
  timestamp: number;
  usageCount: number;
}

interface FilterHistoryState {
  recentFilters: FilterHistoryEntry[];
  maxHistorySize: number;
  
  // Actions
  addFilter: (entry: Omit<FilterHistoryEntry, 'id' | 'timestamp' | 'usageCount'>) => void;
  removeFilter: (id: string) => void;
  clearHistory: () => void;
  incrementUsage: (id: string) => void;
  getTopFilters: (limit?: number) => FilterHistoryEntry[];
  getRecentFilters: (limit?: number) => FilterHistoryEntry[];
}

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useFilterHistoryStore = create<FilterHistoryState>()(
  persist(
    (set, get) => ({
      recentFilters: [],
      maxHistorySize: 20,

      addFilter: (entry) => {
        const state = get();
        
        // Check if an identical query already exists
        const existingIndex = state.recentFilters.findIndex(
          f => f.query.toLowerCase().trim() === entry.query.toLowerCase().trim()
        );

        if (existingIndex >= 0) {
          // Move to top and increment usage
          const existing = state.recentFilters[existingIndex];
          const updated = {
            ...existing,
            timestamp: Date.now(),
            usageCount: existing.usageCount + 1,
            filterCount: entry.filterCount,
            criteria: entry.criteria,
            wasAIInterpreted: entry.wasAIInterpreted,
          };
          
          set({
            recentFilters: [
              updated,
              ...state.recentFilters.slice(0, existingIndex),
              ...state.recentFilters.slice(existingIndex + 1),
            ].slice(0, state.maxHistorySize),
          });
        } else {
          // Add new entry
          const newEntry: FilterHistoryEntry = {
            ...entry,
            id: generateId(),
            timestamp: Date.now(),
            usageCount: 1,
          };
          
          set({
            recentFilters: [newEntry, ...state.recentFilters].slice(0, state.maxHistorySize),
          });
        }
      },

      removeFilter: (id) => {
        set((state) => ({
          recentFilters: state.recentFilters.filter((f) => f.id !== id),
        }));
      },

      clearHistory: () => {
        set({ recentFilters: [] });
      },

      incrementUsage: (id) => {
        set((state) => ({
          recentFilters: state.recentFilters.map((f) =>
            f.id === id ? { ...f, usageCount: f.usageCount + 1, timestamp: Date.now() } : f
          ),
        }));
      },

      getTopFilters: (limit = 5) => {
        const state = get();
        return [...state.recentFilters]
          .sort((a, b) => b.usageCount - a.usageCount)
          .slice(0, limit);
      },

      getRecentFilters: (limit = 5) => {
        const state = get();
        return state.recentFilters.slice(0, limit);
      },
    }),
    {
      name: 'taskluid-filter-history',
      version: 1,
    }
  )
);

export default useFilterHistoryStore;
