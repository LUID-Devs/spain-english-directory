import { describe, it, expect, beforeEach } from 'vitest';
import { useFilterHistoryStore } from './filterHistoryStore';

describe('filterHistoryStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useFilterHistoryStore.setState({
      recentFilters: [],
      maxHistorySize: 20,
    });
  });

  describe('addFilter', () => {
    it('should add a new filter to history', () => {
      const store = useFilterHistoryStore.getState();
      
      store.addFilter({
        query: 'high priority tasks',
        criteria: { priority: ['High'] },
        filterCount: 1,
        wasAIInterpreted: false,
      });

      const state = useFilterHistoryStore.getState();
      expect(state.recentFilters).toHaveLength(1);
      expect(state.recentFilters[0].query).toBe('high priority tasks');
      expect(state.recentFilters[0].usageCount).toBe(1);
    });

    it('should increment usage count for duplicate queries', () => {
      const store = useFilterHistoryStore.getState();
      
      store.addFilter({
        query: 'my tasks',
        criteria: { assignee: ['me'] },
        filterCount: 1,
        wasAIInterpreted: false,
      });

      store.addFilter({
        query: 'my tasks',
        criteria: { assignee: ['me'] },
        filterCount: 1,
        wasAIInterpreted: false,
      });

      const state = useFilterHistoryStore.getState();
      expect(state.recentFilters).toHaveLength(1);
      expect(state.recentFilters[0].usageCount).toBe(2);
    });

    it('should move duplicate query to top', () => {
      const store = useFilterHistoryStore.getState();
      
      store.addFilter({
        query: 'first query',
        criteria: {},
        filterCount: 0,
        wasAIInterpreted: false,
      });

      store.addFilter({
        query: 'second query',
        criteria: {},
        filterCount: 0,
        wasAIInterpreted: false,
      });

      store.addFilter({
        query: 'first query',
        criteria: {},
        filterCount: 0,
        wasAIInterpreted: false,
      });

      const state = useFilterHistoryStore.getState();
      expect(state.recentFilters[0].query).toBe('first query');
      expect(state.recentFilters).toHaveLength(2);
    });

    it('should limit history to maxHistorySize', () => {
      const store = useFilterHistoryStore.getState();
      useFilterHistoryStore.setState({ maxHistorySize: 3 });

      for (let i = 0; i < 5; i++) {
        store.addFilter({
          query: `query ${i}`,
          criteria: {},
          filterCount: 0,
          wasAIInterpreted: false,
        });
      }

      const state = useFilterHistoryStore.getState();
      expect(state.recentFilters).toHaveLength(3);
      expect(state.recentFilters[0].query).toBe('query 4');
    });
  });

  describe('removeFilter', () => {
    it('should remove a filter by id', () => {
      const store = useFilterHistoryStore.getState();
      
      store.addFilter({
        query: 'query to remove',
        criteria: {},
        filterCount: 0,
        wasAIInterpreted: false,
      });

      const id = useFilterHistoryStore.getState().recentFilters[0].id;
      store.removeFilter(id);

      const state = useFilterHistoryStore.getState();
      expect(state.recentFilters).toHaveLength(0);
    });
  });

  describe('clearHistory', () => {
    it('should clear all filters', () => {
      const store = useFilterHistoryStore.getState();
      
      store.addFilter({
        query: 'query 1',
        criteria: {},
        filterCount: 0,
        wasAIInterpreted: false,
      });

      store.addFilter({
        query: 'query 2',
        criteria: {},
        filterCount: 0,
        wasAIInterpreted: false,
      });

      store.clearHistory();

      const state = useFilterHistoryStore.getState();
      expect(state.recentFilters).toHaveLength(0);
    });
  });

  describe('incrementUsage', () => {
    it('should increment usage count', () => {
      const store = useFilterHistoryStore.getState();
      
      store.addFilter({
        query: 'test query',
        criteria: {},
        filterCount: 0,
        wasAIInterpreted: false,
      });

      const id = useFilterHistoryStore.getState().recentFilters[0].id;
      store.incrementUsage(id);

      const state = useFilterHistoryStore.getState();
      expect(state.recentFilters[0].usageCount).toBe(2);
    });
  });

  describe('getTopFilters', () => {
    it('should return filters sorted by usage count', () => {
      const store = useFilterHistoryStore.getState();
      
      store.addFilter({
        query: 'less used',
        criteria: {},
        filterCount: 0,
        wasAIInterpreted: false,
      });

      store.addFilter({
        query: 'more used',
        criteria: {},
        filterCount: 0,
        wasAIInterpreted: false,
      });

      // Increment usage for the second filter
      const id = useFilterHistoryStore.getState().recentFilters[0].id;
      store.incrementUsage(id);
      store.incrementUsage(id);

      const topFilters = store.getTopFilters(2);
      expect(topFilters[0].query).toBe('more used');
      expect(topFilters[0].usageCount).toBe(3);
    });
  });

  describe('getRecentFilters', () => {
    it('should return filters sorted by timestamp', () => {
      const store = useFilterHistoryStore.getState();
      
      store.addFilter({
        query: 'older',
        criteria: {},
        filterCount: 0,
        wasAIInterpreted: false,
      });

      store.addFilter({
        query: 'newer',
        criteria: {},
        filterCount: 0,
        wasAIInterpreted: false,
      });

      const recentFilters = store.getRecentFilters(2);
      expect(recentFilters[0].query).toBe('newer');
      expect(recentFilters[1].query).toBe('older');
    });
  });
});
