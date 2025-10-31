import React, { useState } from "react";
import { useParams } from 'react-router-dom';
import ProjectHeader from "@/app/dashboard/projects/ProjectHeader";
import Board from "@/app/dashboard/projects/BoardView";
import List from "@/app/dashboard/projects/ListView";
import Timeline from "@/app/dashboard/projects/Timeline";
import Table from "@/app/dashboard/projects/Table";
import ModalNewTask from "@/components/ModalNewTask";
import { useGetProjectsQuery } from "@/hooks/useApi";

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: projects } = useGetProjectsQuery();
  const currentProject = projects?.find(project => project.id === parseInt(id || '0'));

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
        <Board id={id || '0'} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
      {activeTab === "List" && (
        <List id={id || '0'} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
      {activeTab === "Timeline" && (
        <Timeline id={id || '0'} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
      {activeTab === "Table" && (
        <Table id={id || '0'} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
    </div>
  );
};

export default ProjectDetailPage;