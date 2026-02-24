import React, { useState, useEffect } from "react";
import { Pencil, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUpdateAgent, Agent } from "@/hooks/useMissionControl";

interface EditAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent | null;
}

export function EditAgentModal({ isOpen, onClose, agent }: EditAgentModalProps) {
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");
  const [personality, setPersonality] = useState("");

  const updateAgent = useUpdateAgent();

  // Reset form when agent changes
  useEffect(() => {
    if (agent) {
      queueMicrotask(() => {
        setDisplayName(agent.displayName);
        setRole(agent.role);
        setPersonality(
          typeof agent.personality === "object" && agent.personality
            ? (agent.personality as { description?: string }).description || ""
            : ""
        );
      });
    }
  }, [agent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agent) return;

    try {
      await updateAgent.mutateAsync({
        agentId: agent.id,
        data: {
          displayName: displayName.trim(),
          role: role.trim(),
          personality: personality ? { description: personality } : {},
        },
      });
      handleClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    updateAgent.reset();
    onClose();
  };

  if (!agent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Edit Agent
          </DialogTitle>
          <DialogDescription>
            Update the details for &quot;{agent.name}&quot;. The agent name cannot be changed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="agentName">Agent Name</Label>
            <Input
              id="agentName"
              value={agent.name}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Agent names cannot be changed after creation
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Support Bot"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="customer-support"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personality">Description (Optional)</Label>
            <Textarea
              id="personality"
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              placeholder="Describe the agent's personality and behavior..."
              rows={3}
            />
          </div>

          {updateAgent.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{updateAgent.error.message}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!displayName || !role || updateAgent.isPending}
            >
              {updateAgent.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditAgentModal;
