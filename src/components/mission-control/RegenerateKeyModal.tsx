import React, { useState } from "react";
import { Key, Copy, Check, AlertTriangle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRegenerateAgentKey, Agent, RegenerateKeyResponse } from "@/hooks/useMissionControl";

interface RegenerateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent | null;
}

export function RegenerateKeyModal({ isOpen, onClose, agent }: RegenerateKeyModalProps) {
  const [newKeyData, setNewKeyData] = useState<RegenerateKeyResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const regenerateKey = useRegenerateAgentKey();

  const handleRegenerate = async () => {
    if (!agent) return;

    try {
      const result = await regenerateKey.mutateAsync(agent.id);
      setNewKeyData(result);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCopyKey = async () => {
    if (newKeyData?.apiKey) {
      await navigator.clipboard.writeText(newKeyData.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setNewKeyData(null);
    setCopied(false);
    regenerateKey.reset();
    onClose();
  };

  if (!agent) return null;

  // Show new key after regeneration
  if (newKeyData) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-green-500" />
              New API Key Generated
            </DialogTitle>
            <DialogDescription>
              Save the new API key for &quot;{agent.displayName}&quot; below. The old key is now invalid.
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
              <Label>New API Key</Label>
              <div className="flex gap-2">
                <Input
                  value={newKeyData.apiKey}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyKey}
                  aria-label={copied ? "API key copied" : "Copy API key"}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
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
            <Key className="h-5 w-5" />
            Regenerate API Key
          </DialogTitle>
          <DialogDescription>
            Generate a new API key for &quot;{agent.displayName}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This will immediately invalidate the current API key. Any running agent instances using the old key will stop working.
            </AlertDescription>
          </Alert>

          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Agent:</span>
              <span className="font-medium">{agent.displayName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-mono text-xs">{agent.name}</span>
            </div>
          </div>

          {regenerateKey.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{regenerateKey.error.message}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRegenerate}
            disabled={regenerateKey.isPending}
          >
            {regenerateKey.isPending ? "Generating..." : "Regenerate Key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RegenerateKeyModal;
