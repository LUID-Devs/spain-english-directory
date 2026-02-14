import { useEffect, useCallback, useState, useRef } from 'react';
import { useApiStore } from '@/stores/apiStore';
import { apiService } from '@/services/apiService';
import type { RoadmapProject, Milestone, ProjectDependency, CreateMilestoneRequest, CreateDependencyRequest } from '@/services/apiService';

// Hook to fetch roadmap data
export const useRoadmapData = (options: { skip?: boolean } = {}) => {
  const [data, setData] = useState<{
    projects: RoadmapProject[];
    milestones: Milestone[];
    dependencies: ProjectDependency[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const hasFetchedRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (options.skip) return;

    try {
      setIsLoading(true);
      setError(null);
      const orgId = localStorage.getItem('activeOrganizationId');
      const roadmapData = await apiService.getRoadmapData(orgId ? parseInt(orgId) : undefined);
      setData(roadmapData);
      return roadmapData;
    } catch (err) {
      console.error('Failed to fetch roadmap data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch roadmap data'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [options.skip]);

  useEffect(() => {
    if (!options.skip && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchData();
    }
  }, [fetchData, options.skip]);

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    refetch: fetchData,
  };
};

// Hook to fetch milestones
export const useMilestones = (projectId?: number, options: { skip?: boolean } = {}) => {
  const [data, setData] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMilestones = useCallback(async () => {
    if (options.skip) return;

    try {
      setIsLoading(true);
      setError(null);
      const milestones = await apiService.getMilestones(projectId);
      setData(milestones);
      return milestones;
    } catch (err) {
      console.error('Failed to fetch milestones:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch milestones'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, options.skip]);

  useEffect(() => {
    if (!options.skip) {
      fetchMilestones();
    }
  }, [fetchMilestones, options.skip]);

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    refetch: fetchMilestones,
  };
};

// Hook to create a milestone
export const useCreateMilestone = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createMilestone = useCallback(async (data: CreateMilestoneRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const milestone = await apiService.createMilestone(data);
      return milestone;
    } catch (err) {
      console.error('Failed to create milestone:', err);
      setError(err instanceof Error ? err : new Error('Failed to create milestone'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createMilestone,
    isLoading,
    isError: !!error,
    error,
  };
};

// Hook to update a milestone
export const useUpdateMilestone = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateMilestone = useCallback(async (milestoneId: number, data: Partial<CreateMilestoneRequest>) => {
    try {
      setIsLoading(true);
      setError(null);
      const milestone = await apiService.updateMilestone(milestoneId, data);
      return milestone;
    } catch (err) {
      console.error('Failed to update milestone:', err);
      setError(err instanceof Error ? err : new Error('Failed to update milestone'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    updateMilestone,
    isLoading,
    isError: !!error,
    error,
  };
};

// Hook to delete a milestone
export const useDeleteMilestone = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteMilestone = useCallback(async (milestoneId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiService.deleteMilestone(milestoneId);
      return result;
    } catch (err) {
      console.error('Failed to delete milestone:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete milestone'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    deleteMilestone,
    isLoading,
    isError: !!error,
    error,
  };
};

// Hook to fetch project dependencies
export const useProjectDependencies = (projectId?: number, options: { skip?: boolean } = {}) => {
  const [data, setData] = useState<ProjectDependency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDependencies = useCallback(async () => {
    if (options.skip) return;

    try {
      setIsLoading(true);
      setError(null);
      const dependencies = await apiService.getProjectDependencies(projectId);
      setData(dependencies);
      return dependencies;
    } catch (err) {
      console.error('Failed to fetch dependencies:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch dependencies'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, options.skip]);

  useEffect(() => {
    if (!options.skip) {
      fetchDependencies();
    }
  }, [fetchDependencies, options.skip]);

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    refetch: fetchDependencies,
  };
};

// Hook to create a project dependency
export const useCreateProjectDependency = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createDependency = useCallback(async (data: CreateDependencyRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const dependency = await apiService.createProjectDependency(data);
      return dependency;
    } catch (err) {
      console.error('Failed to create dependency:', err);
      setError(err instanceof Error ? err : new Error('Failed to create dependency'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createDependency,
    isLoading,
    isError: !!error,
    error,
  };
};

// Hook to delete a project dependency
export const useDeleteProjectDependency = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteDependency = useCallback(async (dependencyId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiService.deleteProjectDependency(dependencyId);
      return result;
    } catch (err) {
      console.error('Failed to delete dependency:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete dependency'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    deleteDependency,
    isLoading,
    isError: !!error,
    error,
  };
};
