import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGetTaskQuery } from '@/hooks/useApi';

// Lazy load TaskDetailModal to reduce initial bundle size
const TaskDetailModal = React.lazy(() => import('@/components/TaskDetailModal'));

interface TaskModalContextType {
  openTaskModal: (taskId: number, projectId?: number, editMode?: boolean) => void;
  closeTaskModal: () => void;
  isTaskModalOpen: boolean;
  currentTaskId: number | null;
}

const TaskModalContext = createContext<TaskModalContextType | undefined>(undefined);
const fallbackContext: TaskModalContextType = {
  openTaskModal: () => {
    // no-op fallback to avoid crashing the dashboard if provider is temporarily unavailable
  },
  closeTaskModal: () => {
    // no-op fallback to avoid crashing the dashboard if provider is temporarily unavailable
  },
  isTaskModalOpen: false,
  currentTaskId: null,
};

const warnedComponents = new Set<string>();

export const useTaskModal = (componentName?: string) => {
  const context = useContext(TaskModalContext);
  
  if (!context) {
    // Schedule warning outside of render to avoid issues
    if (import.meta.env.DEV) {
      const key = componentName || 'unknown';
      if (!warnedComponents.has(key)) {
        warnedComponents.add(key);
        queueMicrotask(() => {
          console.warn('useTaskModal called without TaskModalProvider; using fallback context.');
        });
      }
    }
    return fallbackContext;
  }
  return context;
};

interface TaskModalProviderProps {
  children: ReactNode;
}

export const TaskModalProvider: React.FC<TaskModalProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<number | undefined>(undefined);
  const [editMode, setEditMode] = useState(false);
  const [openedViaDirectUrl, setOpenedViaDirectUrl] = useState(false);

  // Store the background location (where to return when closing the modal)
  const backgroundLocationRef = useRef<string | null>(null);

  // Fetch task data to get projectId when opened via direct URL
  const { data: taskData } = useGetTaskQuery(currentTaskId || 0, {
    skip: !currentTaskId || !openedViaDirectUrl,
  });

  // Update background location when task data is loaded for direct URL access
  useEffect(() => {
    if (taskData && openedViaDirectUrl && !backgroundLocationRef.current?.includes('/projects/')) {
      // Set background location to the task's project
      backgroundLocationRef.current = `/dashboard/projects/${taskData.projectId}`;
      queueMicrotask(() => setCurrentProjectId(taskData.projectId));
    }
  }, [taskData, openedViaDirectUrl]);

  // Check if the current URL is a task detail URL
  useEffect(() => {
    const taskMatch = location.pathname.match(/^\/dashboard\/tasks\/(\d+)$/);

    if (taskMatch) {
      const taskId = parseInt(taskMatch[1], 10);

      // If we have a stored background location, open as modal
      // If navigated directly (no background), also open as modal but set default return path
      if (!isTaskModalOpen || currentTaskId !== taskId) {
        // Check if this is a direct URL access (no stored background location)
        const isDirectUrlAccess = !backgroundLocationRef.current ||
          backgroundLocationRef.current === '/dashboard' ||
          !backgroundLocationRef.current.includes('/projects/');

        queueMicrotask(() => {
          if (isDirectUrlAccess) {
            // Mark as opened via direct URL so we fetch task data for projectId
            setOpenedViaDirectUrl(true);
            // Temporary default - will be updated when task data loads
            backgroundLocationRef.current = '/dashboard';
          }

          setCurrentTaskId(taskId);
          setIsTaskModalOpen(true);
        });
      }
    } else {
      // Not on a task URL, close modal if open
      if (isTaskModalOpen) {
        queueMicrotask(() => {
          setIsTaskModalOpen(false);
          setCurrentTaskId(null);
          setCurrentProjectId(undefined);
          setEditMode(false);
          setOpenedViaDirectUrl(false);
        });
      }
      // Update background location when not on task page
      backgroundLocationRef.current = location.pathname;
    }
  }, [location.pathname]);

  const openTaskModal = useCallback((taskId: number, projectId?: number, editModeFlag: boolean = false) => {
    // Store current location as background before navigating
    backgroundLocationRef.current = location.pathname;

    setCurrentTaskId(taskId);
    setCurrentProjectId(projectId);
    setEditMode(editModeFlag);
    setIsTaskModalOpen(true);
    setOpenedViaDirectUrl(false);

    // Navigate to the task URL
    navigate(`/dashboard/tasks/${taskId}`);
  }, [location.pathname, navigate]);

  const closeTaskModal = useCallback(() => {
    // Navigate back to the background location
    const returnPath = backgroundLocationRef.current || '/dashboard';

    setIsTaskModalOpen(false);
    setCurrentTaskId(null);
    setCurrentProjectId(undefined);
    setEditMode(false);
    setOpenedViaDirectUrl(false);
    backgroundLocationRef.current = null;

    navigate(returnPath);
  }, [navigate]);

  return (
    <TaskModalContext.Provider
      value={{
        openTaskModal,
        closeTaskModal,
        isTaskModalOpen,
        currentTaskId,
      }}
    >
      {children}

      {/* Global Task Detail Modal */}
      {currentTaskId && (
        <Suspense fallback={null}>
          <TaskDetailModal
            isOpen={isTaskModalOpen}
            onClose={closeTaskModal}
            taskId={currentTaskId}
            projectId={currentProjectId}
            editMode={editMode}
          />
        </Suspense>
      )}
    </TaskModalContext.Provider>
  );
};
