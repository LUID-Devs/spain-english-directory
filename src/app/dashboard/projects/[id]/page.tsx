"use client";

import React, { useState } from "react";
import ProjectHeader from "@/app/dashboard/projects/ProjectHeader";
import Board from "@/app/dashboard/projects/BoardView";
import List from "@/app/dashboard/projects/ListView";
import Timeline from "@/app/dashboard/projects/Timeline";
import Table from "@/app/dashboard/projects/Table";
import ModalNewTask from "@/components/ModalNewTask";
import { useGetProjectsQuery } from "@/state/api";

type Props = {
  params: Promise<{ id: string }>;
};

const Project = ({ params }: Props) => {
  // Unwrap params using React.use()
  const { id } = React.use(params);

  const { data: projects } = useGetProjectsQuery();
  const currentProject = projects?.find(project => project.id === parseInt(id));

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
        <Board id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
      {activeTab === "List" && (
        <List id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
      {activeTab === "Timeline" && (
        <Timeline id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
      {activeTab === "Table" && (
        <Table id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
    </div>
  );
};

export default Project;
