import React, { useState } from 'react';
import { useAuth } from '../../app/authProvider';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Loader2 } from 'lucide-react';
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
      let headers: HeadersInit = {
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
        console.log('No Cognito session for workspace creation');
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
        // Reload to show new workspace in dropdown
        window.location.reload();
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
    <Modal isOpen={isOpen} onClose={handleClose} name="Create Workspace">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="workspace-name">Workspace Name *</Label>
          <Input
            id="workspace-name"
            placeholder="e.g., Marketing Team"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={isLoading}
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="workspace-description">Description (optional)</Label>
          <Textarea
            id="workspace-description"
            placeholder="What is this workspace for?"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={isLoading}
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !formData.name.trim()}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Workspace'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateWorkspaceModal;
