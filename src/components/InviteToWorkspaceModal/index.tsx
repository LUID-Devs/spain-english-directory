import React, { useState } from 'react';
import { useAuth } from '../../app/authProvider';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Loader2, Mail, UserPlus, Copy, Check } from 'lucide-react';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InviteToWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface InviteResponse {
  success: boolean;
  message: string;
  invite?: {
    id: number;
    email: string;
    role: string;
    inviteUrl: string;
  };
}

const InviteToWorkspaceModal: React.FC<InviteToWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { activeOrganization } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<InviteResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'member',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.email.trim()) {
      setError('Email address is required');
      return;
    }

    if (!activeOrganization?.id) {
      setError('No workspace selected');
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

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/organizations/${activeOrganization.id}/invites`,
        {
          method: 'POST',
          credentials: 'include',
          headers,
          body: JSON.stringify({
            email: formData.email.trim().toLowerCase(),
            role: formData.role,
            message: formData.message.trim() || undefined,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(data);
        setFormData({ email: '', role: 'member', message: '' });
        onSuccess?.();
      } else {
        setError(data.message || 'Failed to send invitation');
      }
    } catch (err) {
      console.error('Invite error:', err);
      setError('An error occurred while sending the invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ email: '', role: 'member', message: '' });
    setError(null);
    setSuccess(null);
    setCopied(false);
    onClose();
  };

  const copyInviteLink = async () => {
    if (success?.invite?.inviteUrl) {
      try {
        await navigator.clipboard.writeText(success.invite.inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const workspaceName = activeOrganization?.settings?.isPersonal
    ? 'Personal Workspace'
    : activeOrganization?.name || 'Workspace';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} name="Invite to Workspace">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Invite someone to join <span className="font-medium">{workspaceName}</span>
        </p>

        {success ? (
          <div className="space-y-4">
            <Alert className="bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800">
              <Check className="h-4 w-4 text-gray-600" aria-hidden="true" />
              <AlertDescription className="text-gray-800 dark:text-gray-200">
                Invitation sent to <span className="font-medium">{success.invite?.email}</span>
              </AlertDescription>
            </Alert>

            {success.invite?.inviteUrl && (
              <div className="space-y-2">
                <Label>Share this invite link</Label>
                <div className="flex gap-2">
                  <Input
                    value={success.invite.inviteUrl}
                    readOnly
                    className="text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copyInviteLink}
                    aria-label={copied ? "Invite link copied" : "Copy invite link"}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-gray-600" aria-hidden="true" />
                    ) : (
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This link expires in 7 days
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSuccess(null);
                  setFormData({ email: '', role: 'member', message: '' });
                }}
                className="flex-1"
              >
                <UserPlus className="w-4 h-4 mr-2" aria-hidden="true" />
                Invite Another
              </Button>
              <Button
                type="button"
                onClick={handleClose}
                className="flex-1"
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">
                    <div>
                      <div className="font-medium">Member</div>
                      <div className="text-xs text-muted-foreground">Can view and edit projects and tasks</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div>
                      <div className="font-medium">Admin</div>
                      <div className="text-xs text-muted-foreground">Can manage members and workspace settings</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div>
                      <div className="font-medium">Viewer</div>
                      <div className="text-xs text-muted-foreground">Can only view projects and tasks</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-message">Personal Message (optional)</Label>
              <Textarea
                id="invite-message"
                placeholder="Add a personal message to include in the invitation email..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                disabled={isLoading}
                rows={2}
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
                disabled={isLoading || !formData.email.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" aria-hidden="true" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default InviteToWorkspaceModal;
