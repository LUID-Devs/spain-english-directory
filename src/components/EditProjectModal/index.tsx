import Modal from "@/components/Modal";
import { useUpdateProjectMutation, Project } from "@/state/api";
import React, { useState, useEffect } from "react";
import { formatISO, format } from "date-fns";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
};

const EditProjectModal = ({ isOpen, onClose, project }: Props) => {
  const [updateProject, { isLoading }] = useUpdateProjectMutation();
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string>("");

  // Populate form with project data when modal opens
  useEffect(() => {
    if (isOpen && project) {
      setProjectName(project.name);
      setDescription(project.description || "");
      setStartDate(project.startDate ? format(new Date(project.startDate), "yyyy-MM-dd") : "");
      setEndDate(project.endDate ? format(new Date(project.endDate), "yyyy-MM-dd") : "");
      setError("");
    }
  }, [isOpen, project]);

  const handleSubmit = async () => {
    if (!projectName || !startDate || !endDate) {
      setError("Please fill in all required fields");
      return;
    }

    setError(""); // Clear any previous errors

    try {
      const formattedStartDate = formatISO(new Date(startDate), {
        representation: "complete",
      });
      const formattedEndDate = formatISO(new Date(endDate), {
        representation: "complete",
      });

      await updateProject({
        id: project.id,
        project: {
          name: projectName,
          description,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        },
      }).unwrap();

      // Success - close modal
      onClose();
    } catch (err: any) {
      // Handle error
      setError(err?.data?.message || "Failed to update project. Please try again.");
    }
  };

  const isFormValid = () => {
    return projectName && startDate && endDate;
  };

  const inputStyles =
    "w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none";

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Edit Project">
      <form
        className="mt-4 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Name *
          </label>
          <input
            type="text"
            className={inputStyles}
            placeholder="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            className={inputStyles}
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              className={inputStyles}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date *
            </label>
            <input
              type="date"
              className={inputStyles}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`flex-1 px-4 py-2 text-white bg-blue-primary hover:bg-blue-600 rounded-md transition-colors ${
              !isFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""
            }`}
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? "Updating..." : "Update Project"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProjectModal;