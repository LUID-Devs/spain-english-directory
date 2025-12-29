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
import { AlertTriangle, Building2 } from "lucide-react";

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
          <Label htmlFor="projectName">Project Name *</Label>
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
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date *</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
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