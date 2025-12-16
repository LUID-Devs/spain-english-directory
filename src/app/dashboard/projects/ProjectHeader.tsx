import React from "react";
import {
  Clock,
  Filter,
  Grid3x3,
  List,
  Plus,
  Share,
  Table,
  Search,
  Folder,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  projectName: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

const ProjectHeader = ({ activeTab, setActiveTab, projectName, setIsModalNewTaskOpen }: Props) => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Folder className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-3xl">{projectName}</CardTitle>
                <p className="text-muted-foreground">Project management and task tracking</p>
              </div>
            </div>
            <Button onClick={() => setIsModalNewTaskOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation and Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Tab Navigation */}
            <div className="flex items-center gap-2">
              <TabButton
                name="Board"
                icon={<Grid3x3 className="h-4 w-4" />}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
              <TabButton
                name="List"
                icon={<List className="h-4 w-4" />}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
              <TabButton
                name="Timeline"
                icon={<Clock className="h-4 w-4" />}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
              <TabButton
                name="Table"
                icon={<Table className="h-4 w-4" />}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Share className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Task"
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

type TabButtonProps = {
  name: string;
  icon: React.ReactNode;
  activeTab: string;
  setActiveTab: (tabName: string) => void;
};

const TabButton = ({ name, icon, setActiveTab, activeTab }: TabButtonProps) => {
  const isActive = activeTab === name;

  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={() => setActiveTab(name)}
      className={cn(
        "flex items-center gap-2",
        isActive && "bg-primary text-primary-foreground"
      )}
    >
      {icon}
      {name}
    </Button>
  );
};

export default ProjectHeader;
