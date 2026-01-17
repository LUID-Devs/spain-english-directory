import React, { useState } from "react";
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
  X,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Priority } from "@/hooks/useApi";

export type FilterState = {
  priority: string | null;
  status: string | null;
  assigneeId: number | null;
};

type Props = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  projectName: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  projectId: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableStatuses: string[];
  availableAssignees: { userId: number; username: string }[];
};

const ProjectHeader = ({
  activeTab,
  setActiveTab,
  projectName,
  setIsModalNewTaskOpen,
  projectId,
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  availableStatuses,
  availableAssignees,
}: Props) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleShare = () => {
    const projectUrl = `${window.location.origin}/dashboard/projects/${projectId}`;
    navigator.clipboard.writeText(projectUrl).then(() => {
      toast.success("Project link copied to clipboard");
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      priority: null,
      status: null,
      assigneeId: null,
    });
  };

  const activeFiltersCount = [filters.priority, filters.status, filters.assigneeId].filter(Boolean).length;

  return (
    <div className="container mx-auto px-4 py-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Folder className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
              <div className="min-w-0">
                <CardTitle className="text-xl sm:text-2xl md:text-3xl truncate">{projectName}</CardTitle>
                <p className="text-sm text-muted-foreground hidden sm:block">Project management and task tracking</p>
              </div>
            </div>
            <Button onClick={() => setIsModalNewTaskOpen(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation and Controls */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            {/* Tab Navigation - Scrollable on mobile */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Filter Popover */}
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Filter className="h-4 w-4" />
                    {activeFiltersCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                      >
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[calc(100vw-2rem)] sm:w-80" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Filter Tasks</h4>
                      {activeFiltersCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearFilters}
                          className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Clear all
                        </Button>
                      )}
                    </div>

                    {/* Priority Filter */}
                    <div className="space-y-2">
                      <Label className="text-sm">Priority</Label>
                      <Select
                        value={filters.priority || "all"}
                        onValueChange={(value) =>
                          onFiltersChange({ ...filters, priority: value === "all" ? null : value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All priorities" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All priorities</SelectItem>
                          {Object.values(Priority).map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {priority}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                      <Label className="text-sm">Status</Label>
                      <Select
                        value={filters.status || "all"}
                        onValueChange={(value) =>
                          onFiltersChange({ ...filters, status: value === "all" ? null : value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All statuses</SelectItem>
                          {availableStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Assignee Filter */}
                    <div className="space-y-2">
                      <Label className="text-sm">Assignee</Label>
                      <Select
                        value={filters.assigneeId?.toString() || "all"}
                        onValueChange={(value) =>
                          onFiltersChange({
                            ...filters,
                            assigneeId: value === "all" ? null : parseInt(value),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All assignees" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All assignees</SelectItem>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {availableAssignees?.map((user) => (
                            <SelectItem key={user.userId} value={user.userId.toString()}>
                              {user.username}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Share Button */}
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share className="h-4 w-4" />
              </Button>

              {/* Search Input */}
              <div className="relative flex-1 sm:flex-none order-first sm:order-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Task"
                  className="pl-10 w-full sm:w-48 md:w-64"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => onSearchChange("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Filter and Share Buttons */}
              <div className="flex items-center gap-2">
                {/* Filter Popover is above */}
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(activeFiltersCount > 0 || searchQuery) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{searchQuery}"
                  <button onClick={() => onSearchChange("")} className="ml-1 hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.priority && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Priority: {filters.priority}
                  <button
                    onClick={() => onFiltersChange({ ...filters, priority: null })}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.status && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {filters.status}
                  <button
                    onClick={() => onFiltersChange({ ...filters, status: null })}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.assigneeId !== null && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Assignee: {filters.assigneeId === 0 ? "Unassigned" : availableAssignees?.find(u => u.userId === filters.assigneeId)?.username || "Unknown"}
                  <button
                    onClick={() => onFiltersChange({ ...filters, assigneeId: null })}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
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
