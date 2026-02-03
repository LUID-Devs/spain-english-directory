import React, { useState } from "react";
import { Bot, Copy, Check, AlertCircle } from "lucide-react";
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
import { useCreateAgent, CreateAgentResponse } from "@/hooks/useMissionControl";

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateAgentModal({ isOpen, onClose }: CreateAgentModalProps) {
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");
  const [personality, setPersonality] = useState("");
  const [createdAgent, setCreatedAgent] = useState<CreateAgentResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const createAgent = useCreateAgent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await createAgent.mutateAsync({
        name: name.toLowerCase().trim(),
        displayName: displayName.trim(),
        role: role.trim(),
        personality: personality ? { description: personality } : {},
      });
      setCreatedAgent(result);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCopyKey = async () => {
    if (createdAgent?.apiKey) {
      await navigator.clipboard.writeText(createdAgent.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setName("");
    setDisplayName("");
    setRole("");
    setPersonality("");
    setCreatedAgent(null);
    setCopied(false);
    createAgent.reset();
    onClose();
  };

  const isValidName = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(name.toLowerCase());

  // Show API key screen after successful creation
  if (createdAgent) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-green-500" />
              Agent Created
            </DialogTitle>
            <DialogDescription>
              Your agent &quot;{createdAgent.displayName}&quot; has been created. Save the API key below - it won&apos;t be shown again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert className="border-amber-500 bg-amber-500/10">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-600 dark:text-amber-400">
                Copy this API key now. For security reasons, it cannot be retrieved later.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="flex gap-2">
                <Input
                  value={createdAgent.apiKey}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyKey}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <p className="font-medium">{createdAgent.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Role:</span>
                <p className="font-medium">{createdAgent.role}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Create New Agent
          </DialogTitle>
          <DialogDescription>
            Create an AI agent for your organization. You&apos;ll receive an API key to authenticate the agent.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Agent Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase())}
              placeholder="my-agent"
              required
            />
            <p className="text-xs text-muted-foreground">
              Lowercase letters, numbers, and dashes only (e.g., &quot;support-bot&quot;)
            </p>
            {name && !isValidName && (
              <p className="text-xs text-red-500">
                Invalid format. Use lowercase alphanumeric with dashes.
              </p>
            )}
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
            <p className="text-xs text-muted-foreground">
              The agent&apos;s function (e.g., &quot;developer&quot;, &quot;content-writer&quot;)
            </p>
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

          {createAgent.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{createAgent.error.message}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name || !displayName || !role || !isValidName || createAgent.isPending}
            >
              {createAgent.isPending ? "Creating..." : "Create Agent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateAgentModal;
