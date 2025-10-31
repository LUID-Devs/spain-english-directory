import React, { useState } from "react";
import Modal from "@/components/Modal";
import { useGetUsersQuery, useGetProjectsQuery, useGetTeamsQuery } from "@/hooks/useApi";

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

export interface SearchFilters {
  query?: string;
  type?: string;
  status?: string;
  priority?: string;
  assigneeId?: number;
  authorId?: number;
  projectId?: number;
  teamId?: number;
  dateFrom?: string;
  dateTo?: string;
  archived?: boolean;
}

const AdvancedSearchModal = ({ 
  isOpen, 
  onClose, 
  onSearch, 
  initialFilters = {} 
}: AdvancedSearchModalProps) => {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  
  const { data: users } = useGetUsersQuery(undefined, {
    skip: !isOpen, // Only load when modal is open
  });
  const { data: projects } = useGetProjectsQuery({}, {
    skip: !isOpen, // Only load when modal is open
  });
  const { data: teams } = useGetTeamsQuery(undefined, {
    skip: !isOpen, // Only load when modal is open
  });

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({});
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Advanced Search">
      <div className="space-y-6">
        {/* Search Query */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search Term
          </label>
          <input
            type="text"
            value={filters.query || ''}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            placeholder="Enter keywords..."
            className="w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
          />
        </div>

        {/* Search Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search In
          </label>
          <select
            value={filters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
          >
            <option value="">All Types</option>
            <option value="tasks">Tasks Only</option>
            <option value="projects">Projects Only</option>
            <option value="users">Users Only</option>
          </select>
        </div>

        {/* Task-specific filters */}
        {(!filters.type || filters.type === 'tasks') && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Task Filters
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  <option value="">Any Status</option>
                  <option value="To Do">To Do</option>
                  <option value="Work In Progress">Work In Progress</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={filters.priority || ''}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  <option value="">Any Priority</option>
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                  <option value="Backlog">Backlog</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Assignee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assigned To
                </label>
                <select
                  value={filters.assigneeId || ''}
                  onChange={(e) => handleFilterChange('assigneeId', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  <option value="">Anyone</option>
                  {users?.map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>

              {/* Author */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Created By
                </label>
                <select
                  value={filters.authorId || ''}
                  onChange={(e) => handleFilterChange('authorId', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  <option value="">Anyone</option>
                  {users?.map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project
              </label>
              <select
                value={filters.projectId || ''}
                onChange={(e) => handleFilterChange('projectId', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              >
                <option value="">Any Project</option>
                {projects?.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Project-specific filters */}
        {(!filters.type || filters.type === 'projects') && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Project Filters
            </h3>
            
            {/* Archived */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.archived || false}
                  onChange={(e) => handleFilterChange('archived', e.target.checked ? true : undefined)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Include archived projects
                </span>
              </label>
            </div>
          </div>
        )}

        {/* User-specific filters */}
        {(!filters.type || filters.type === 'users') && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              User Filters
            </h3>
            
            {/* Team */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Team
              </label>
              <select
                value={filters.teamId || ''}
                onChange={(e) => handleFilterChange('teamId', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              >
                <option value="">Any Team</option>
                {teams?.map((team) => (
                  <option key={team.teamId} value={team.teamId}>
                    {team.teamName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Date Range */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Date Range
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                From
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                To
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSearch}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Search
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AdvancedSearchModal;