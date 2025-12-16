import React, { createContext, useContext, useState, ReactNode } from 'react';
import TaskDetailModal from '@/components/TaskDetailModal';

interface TaskModalContextType {
  openTaskModal: (taskId: number, projectId?: number, editMode?: boolean) => void;
  closeTaskModal: () => void;
  isTaskModalOpen: boolean;
  currentTaskId: number | null;
}

const TaskModalContext = createContext<TaskModalContextType | undefined>(undefined);

export const useTaskModal = () => {
  const context = useContext(TaskModalContext);
  if (!context) {
    throw new Error('useTaskModal must be used within a TaskModalProvider');
  }
  return context;
};

interface TaskModalProviderProps {
  children: ReactNode;
}

export const TaskModalProvider: React.FC<TaskModalProviderProps> = ({ children }) => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<number | undefined>(undefined);
  const [editMode, setEditMode] = useState(false);

  const openTaskModal = (taskId: number, projectId?: number, editModeFlag: boolean = false) => {
    setCurrentTaskId(taskId);
    setCurrentProjectId(projectId);
    setEditMode(editModeFlag);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setCurrentTaskId(null);
    setCurrentProjectId(undefined);
    setEditMode(false);
  };

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
        <TaskDetailModal
          isOpen={isTaskModalOpen}
          onClose={closeTaskModal}
          taskId={currentTaskId}
          projectId={currentProjectId}
          editMode={editMode}
        />
      )}
    </TaskModalContext.Provider>
  );
};