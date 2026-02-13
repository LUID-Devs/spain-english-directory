import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/authProvider';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Loader2, Building2, FileText, AlertTriangle } from 'lucide-react';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Workspace name is required');
      return;
    }

    setIsLoading(true);

    try {
      // Get auth headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      try {
        const session = await fetchAuthSession();
        if (session?.tokens?.accessToken) {
          headers['Authorization'] = `Bearer ${session.tokens.accessToken}`;
        }
        if (session?.tokens?.idToken) {
          headers['X-ID-Token'] = `${session.tokens.idToken}`;
        }
      } catch (e) {
        // No Cognito session available
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/organizations`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh auth to get updated organizations list
        await refreshAuth();
        // Reset form
        setFormData({ name: '', description: '' });
        onClose();
        // Soft reload to show new workspace in dropdown
        navigate(0);
      } else {
        setError(data.message || 'Failed to create workspace');
      }
    } catch (err) {
      console.error('Create workspace error:', err);
      setError('An error occurred while creating the workspace');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '' });
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} name="Create New Workspace">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Header description */}
        <p className="text-sm text-muted-foreground">
          Create a new workspace to organize your team and projects separately.
        </p>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Workspace Name */}
        <div className="space-y-2">
          <Label htmlFor="workspace-name" className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            Workspace Name *
          </Label>
          <Input
            id="workspace-name"
            placeholder="e.g., Marketing Team"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={isLoading}
            className="h-11"
            autoFocus
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="workspace-description" className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            Description
          </Label>
          <Textarea
            id="workspace-description"
            placeholder="What is this workspace for? (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={isLoading}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 h-11"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !formData.name.trim()}
            className="flex-1 h-11 bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                Creating…
              </>
            ) : (
              <>
                <Building2 className="w-4 h-4 mr-2" aria-hidden="true" />
                Create Workspace
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateWorkspaceModal;
