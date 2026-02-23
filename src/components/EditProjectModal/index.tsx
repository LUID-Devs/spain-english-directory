import Modal from "@/components/Modal";
import { useUpdateProjectMutation, Project } from "@/hooks/useApi";
import { useAuth } from "@/app/authProvider";
import React, { useState, useEffect } from "react";
import { formatISO, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AlertTriangle, Building2, HelpCircle } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
};

const EditProjectModal = ({ isOpen, onClose, project }: Props) => {
  const [updateProject, { isLoading }] = useUpdateProjectMutation();
  const { organizations } = useAuth();
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Populate form with project data when modal opens
  useEffect(() => {
    if (isOpen && project) {
      setProjectName(project.name);
      setDescription(project.description || "");
      setStartDate(project.startDate ? format(new Date(project.startDate), "yyyy-MM-dd") : "");
      setEndDate(project.endDate ? format(new Date(project.endDate), "yyyy-MM-dd") : "");
      // @ts-ignore - organizationId exists at runtime
      setSelectedWorkspaceId(project.organizationId?.toString() || "");
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
          organizationId: selectedWorkspaceId ? parseInt(selectedWorkspaceId) : undefined,
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Edit Project">
      <form
        className="mt-4 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="projectName">Project Name *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                  <HelpCircle className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-72" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Project Name Tips</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Use a clear, descriptive name</li>
                    <li>• Include version or phase if applicable</li>
                    <li>• Keep it concise but informative</li>
                  </ul>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Input
            id="projectName"
            type="text"
            placeholder="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="description">Description</Label>
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                  <HelpCircle className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-72" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">What to Include</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Project goals and objectives</li>
                    <li>• Key deliverables</li>
                    <li>• Target audience or stakeholders</li>
                    <li>• Any constraints or requirements</li>
                  </ul>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Textarea
            id="description"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Update the project description to keep the team aligned on scope and goals.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Project Timeline *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                  <HelpCircle className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-72" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Adjusting Timelines</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Changes affect project reporting</li>
                    <li>• Consider impact on existing tasks</li>
                    <li>• Team members will see updated dates</li>
                  </ul>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-xs text-muted-foreground">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-xs text-muted-foreground">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Adjust the project timeline. Ensure all tasks fit within the new date range.
          </p>
        </div>

        {/* Workspace Selection */}
        {organizations.length > 1 && (
          <div className="space-y-2">
            <Label htmlFor="workspace">Workspace</Label>
            <Select
              value={selectedWorkspaceId}
              onValueChange={setSelectedWorkspaceId}
            >
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Select workspace" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id.toString()}>
                    {org.settings?.isPersonal ? 'Personal Workspace' : org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Move this project to a different workspace
            </p>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? "Updating..." : "Update Project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProjectModal;