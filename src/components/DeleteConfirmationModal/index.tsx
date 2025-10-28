import Modal from "@/components/Modal";
import { useDeleteProjectMutation, Project } from "@/state/api";
import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
};

const DeleteConfirmationModal = ({ isOpen, onClose, project }: Props) => {
  const [deleteProject, { isLoading }] = useDeleteProjectMutation();
  const [error, setError] = useState<string>("");

  const handleDelete = async () => {
    setError(""); // Clear any previous errors

    try {
      await deleteProject(project.id).unwrap();
      // Success - close modal
      onClose();
    } catch (err: any) {
      // Handle error
      setError(err?.data?.message || "Failed to delete project. Please try again.");
    }
  };

  const taskCount = project.statistics?.totalTasks || project.taskCount || 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Delete Project">
      <div className="mt-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Delete Project
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Project:</strong> {project.name}
          </p>
          {project.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {project.description}
            </p>
          )}
          {taskCount > 0 && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              <strong>Warning:</strong> This project has {taskCount} task{taskCount !== 1 ? 's' : ''}. 
              All tasks, comments, and attachments will be permanently deleted along with the project.
            </p>
          )}
        </div>

        {taskCount > 0 && !project.archived && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Alternative:</strong> Consider archiving this project instead to preserve the task history 
              while removing it from active use. You can delete archived projects later if needed.
            </p>
          </div>
        )}
        
        {project.archived && taskCount > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Archived Project:</strong> This project is archived, so it can be safely deleted. 
              All associated data will be permanently removed.
            </p>
          </div>
        )}

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to permanently delete this project? 
          This will also delete all associated tasks, comments, and attachments.
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors ${
              isLoading ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {isLoading ? "Deleting..." : "Delete Project"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;