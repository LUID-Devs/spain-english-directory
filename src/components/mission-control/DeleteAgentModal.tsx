import React from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDeleteAgent, Agent } from "@/hooks/useMissionControl";

interface DeleteAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent | null;
}

export function DeleteAgentModal({ isOpen, onClose, agent }: DeleteAgentModalProps) {
  const deleteAgent = useDeleteAgent();

  const handleDelete = async () => {
    if (!agent) return;

    try {
      await deleteAgent.mutateAsync(agent.id);
      handleClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    deleteAgent.reset();
    onClose();
  };

  if (!agent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete Agent
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{agent.displayName}&quot;?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This action cannot be undone. The agent&apos;s API key will be invalidated immediately, and any running instances will stop working.
            </AlertDescription>
          </Alert>

          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Agent Name:</span>
              <span className="font-medium">{agent.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Display Name:</span>
              <span className="font-medium">{agent.displayName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Role:</span>
              <span className="font-medium">{agent.role}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium capitalize">{agent.status}</span>
            </div>
          </div>

          {deleteAgent.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{deleteAgent.error.message}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteAgent.isPending}
          >
            {deleteAgent.isPending ? "Deleting..." : "Delete Agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteAgentModal;
