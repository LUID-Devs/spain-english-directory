
import React, { useState } from "react";
import ProjectHeader from "@/app/dashboard/projects/ProjectHeader";
import Board from "@/app/dashboard/projects/BoardView";
import List from "@/app/dashboard/projects/ListView";
import Timeline from "@/app/dashboard/projects/Timeline";
import Table from "@/app/dashboard/projects/Table";
import ModalNewTask from "@/components/ModalNewTask";
import { useGetProjectsQuery, useGetTasksQuery } from "@/hooks/useApi";

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

  const [activeTab, setActiveTab] = useState("Board");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

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
      />
      {activeTab === "Board" && (
        <Board 
          id={id} 
          setIsModalNewTaskOpen={setIsModalNewTaskOpen}
          tasks={tasks}
          tasksLoading={tasksLoading}
          tasksError={tasksError}
          refetchTasks={refetchTasks}
        />
      )}
      {activeTab === "List" && (
        <List 
          id={id} 
          setIsModalNewTaskOpen={setIsModalNewTaskOpen}
          tasks={tasks}
          tasksLoading={tasksLoading}
          tasksError={tasksError}
          refetchTasks={refetchTasks}
        />
      )}
      {activeTab === "Timeline" && (
        <Timeline 
          id={id} 
          setIsModalNewTaskOpen={setIsModalNewTaskOpen}
          tasks={tasks}
          tasksLoading={tasksLoading}
          tasksError={tasksError}
          refetchTasks={refetchTasks}
        />
      )}
      {activeTab === "Table" && (
        <Table 
          id={id} 
          setIsModalNewTaskOpen={setIsModalNewTaskOpen}
          tasks={tasks}
          tasksLoading={tasksLoading}
          tasksError={tasksError}
          refetchTasks={refetchTasks}
        />
      )}
    </div>
  );
};

export default Project;
