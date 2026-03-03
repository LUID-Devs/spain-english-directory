/**
 * useSkills Hook
 * 
 * React hook for interacting with the agent skills system.
 * Provides state management for skill discovery and execution.
 */

import { useState, useCallback, useEffect } from 'react';
import * as skillService from '../services/skillService';
import type { SkillDefinition, SkillExecutionResult, SkillHealth } from '../services/skillService';

interface UseSkillsOptions {
  autoLoad?: boolean;
  category?: string;
}

interface SkillExecutionState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: string | null;
  result: SkillExecutionResult<T> | null;
}

export function useSkills(options: UseSkillsOptions = {}) {
  const [skills, setSkills] = useState<SkillDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load skills
  const loadSkills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data: SkillDefinition[];
      if (options.category) {
        data = await skillService.getSkillsByCategory(options.category);
      } else {
        data = await skillService.getAllSkills();
      }
      setSkills(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  }, [options.category]);

  // Search skills
  const searchSkills = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await skillService.searchSkills(query);
      setSkills(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load on mount
  useEffect(() => {
    if (options.autoLoad !== false) {
      loadSkills();
    }
  }, [loadSkills, options.autoLoad]);

  return {
    skills,
    loading,
    error,
    loadSkills,
    searchSkills
  };
}

export function useSkill(skillId: string) {
  const [skill, setSkill] = useState<SkillDefinition | null>(null);
  const [health, setHealth] = useState<SkillHealth | null>(null);
  const [permissions, setPermissions] = useState<{
    canExecute: boolean;
    missingPermissions?: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load skill details
  const loadSkill = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await skillService.getSkill(skillId);
      setSkill(data);
      if (data.health) {
        setHealth(data.health);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skill');
    } finally {
      setLoading(false);
    }
  }, [skillId]);

  // Check permissions
  const checkPermissions = useCallback(async (projectId?: number) => {
    try {
      const data = await skillService.checkSkillPermissions(skillId, projectId);
      setPermissions({
        canExecute: data.canExecute,
        missingPermissions: data.missingPermissions
      });
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Permission check failed');
      return null;
    }
  }, [skillId]);

  // Execute skill
  const execute = useCallback(async <T = unknown>(
    parameters: Record<string, unknown>,
    projectId?: number
  ): Promise<SkillExecutionState<T>> => {
    setLoading(true);
    setError(null);
    
    const state: SkillExecutionState<T> = {
      data: null,
      loading: true,
      error: null,
      result: null
    };

    try {
      const result = await skillService.executeSkill<T>(skillId, parameters, projectId);
      state.result = result;
      
      if (result.success) {
        state.data = result.data || null;
      } else {
        state.error = result.error?.message || 'Execution failed';
      }
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Execution failed';
    } finally {
      state.loading = false;
      setLoading(false);
    }

    return state;
  }, [skillId]);

  // Load on mount
  useEffect(() => {
    loadSkill();
  }, [loadSkill]);

  return {
    skill,
    health,
    permissions,
    loading,
    error,
    loadSkill,
    checkPermissions,
    execute
  };
}

export function useSkillExecution<T = unknown>(skillId: string) {
  const [state, setState] = useState<SkillExecutionState<T>>({
    data: null,
    loading: false,
    error: null,
    result: null
  });

  const execute = useCallback(async (
    parameters: Record<string, unknown>,
    projectId?: number
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await skillService.executeSkill<T>(skillId, parameters, projectId);
      
      setState({
        data: result.success ? result.data || null : null,
        loading: false,
        error: result.success ? null : result.error?.message || 'Execution failed',
        result
      });
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Execution failed';
      setState({
        data: null,
        loading: false,
        error,
        result: null
      });
      throw err;
    }
  }, [skillId]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      result: null
    });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
}

// Convenience hooks for specific skills

export function useTaskAnalysis() {
  const execution = useSkillExecution('task:analysis');
  
  const analyze = async (
    taskId: number,
    analysisType: 'categorize' | 'complexity' | 'duplicates' | 'workload' | 'full' = 'full'
  ) => {
    return execution.execute({ taskId, analysisType });
  };

  return {
    ...execution,
    analyze
  };
}

export function useAdvancedSearch() {
  const execution = useSkillExecution('data:search');
  
  const search = async (
    query: string,
    targets: ('tasks' | 'projects' | 'users')[] = ['tasks'],
    filters?: Record<string, unknown>
  ) => {
    return execution.execute({ query, targets, filters });
  };

  return {
    ...execution,
    search
  };
}

export function useNotification() {
  const execution = useSkillExecution('communication:notification');
  
  const notify = async (
    type: 'task_assigned' | 'task_due' | 'mention' | 'project_update' | 'custom',
    recipients: { userIds?: number[]; teamId?: number; projectId?: number },
    content: { title: string; message: string; taskId?: number; projectId?: number; actionUrl?: string },
    options?: { channels?: { inApp?: boolean; email?: boolean; slack?: boolean }; priority?: 'low' | 'normal' | 'high' | 'urgent' }
  ) => {
    return execution.execute({
      type,
      recipients,
      content,
      ...options
    });
  };

  return {
    ...execution,
    notify
  };
}
