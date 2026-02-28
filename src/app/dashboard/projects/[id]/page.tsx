
import React, { useState, useMemo } from "react";
import ProjectHeader, { FilterState } from "@/app/dashboard/projects/ProjectHeader";
import Board from "@/app/dashboard/projects/BoardView";
import List from "@/app/dashboard/projects/ListView";
import Timeline from "@/app/dashboard/projects/Timeline";
import Table from "@/app/dashboard/projects/Table";
import ModalNewTask from "@/components/ModalNewTask";
import { useGetProjectsQuery, useGetTasksQuery, useGetUsersQuery, useGetProjectStatusesQuery, Task } from "@/hooks/useApi";

type Props = {
  params: Promise<{ id: string }>;
};

const Project = ({ params }: Props) => {
  // Unwrap params using React.use()
  const { id } = React.use(params);
  const projectId = parseInt(id);

  const { data: projects } = useGetProjectsQuery();
  const currentProject = projects?.find(project => project.id === projectId);

  // Fetch tasks for this specific project - will refetch when projectId changes
  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
    refetch: refetchTasks
  } = useGetTasksQuery({ projectId }, { skip: !projectId || isNaN(projectId) });

  // Fetch users for assignee filter
  const { data: users = [] } = useGetUsersQuery();

  // Fetch statuses for status filter
  const { data: statusesData } = useGetProjectStatusesQuery(projectId);
  const availableStatuses = useMemo(() => {
    if (statusesData && statusesData.length > 0) {
      return statusesData.map((s) => s.name);
    }
    return ["To Do", "Work In Progress", "Under Review", "Completed"];
  }, [statusesData]);

  const [activeTab, setActiveTab] = useState("Board");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    priority: null,
    status: null,
    assigneeId: null,
  });

  // Filter tasks based on search and filters
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];

    return tasks.filter((task: Task) => {
      // Search filter - check title, description, and tags
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          task.title?.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.tags?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Priority filter
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }

      // Status filter
      if (filters.status && task.status !== filters.status) {
        return false;
      }

      // Assignee filter
      if (filters.assigneeId !== null) {
        if (filters.assigneeId === 0) {
          // "Unassigned" selected - filter for tasks with no assignee
          if (task.assignedUserId) return false;
        } else {
          // Specific assignee selected
          if (task.assignedUserId !== filters.assigneeId) return false;
        }
      }

      return true;
    });
  }, [tasks, searchQuery, filters]);

  return (
    <div>
      {/* MODAL NEW TASK */}
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
        id={id}
      />
      <ProjectHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        projectName={currentProject?.name || "Loading..."}
        setIsModalNewTaskOpen={setIsModalNewTaskOpen}
        projectId={id}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFiltersChange={setFilters}
        availableStatuses={availableStatuses}
        availableAssignees={(users || []) as { userId: number; username: string }[]}
      />
      {activeTab === "Board" && (
        <Board
          id={id}
          tasks={filteredTasks}
          tasksLoading={tasksLoading}
          tasksError={tasksError}
          refetchTasks={refetchTasks}
        />
      )}
      {activeTab === "List" && (
        <List
          id={id}
          tasks={filteredTasks}
          tasksLoading={tasksLoading}
          tasksError={tasksError}
          refetchTasks={refetchTasks}
        />
      )}
      {activeTab === "Timeline" && (
        <Timeline
          id={id}
          tasks={filteredTasks}
          tasksLoading={tasksLoading}
          tasksError={tasksError}
          refetchTasks={refetchTasks}
        />
      )}
      {activeTab === "Table" && (
        <Table
          id={id}
          tasks={filteredTasks}
          tasksLoading={tasksLoading}
          tasksError={tasksError}
          refetchTasks={refetchTasks}
        />
      )}
    </div>
  );
};

export default Project;
