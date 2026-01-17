import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../app/authProvider';
import { ChevronDown, Check, Building2, User, Plus, UserPlus, Settings } from 'lucide-react';
import CreateWorkspaceModal from '../CreateWorkspaceModal';
import InviteToWorkspaceModal from '../InviteToWorkspaceModal';

const WorkspaceSwitcher: React.FC = () => {
  const { organizations, activeOrganization, switchWorkspace } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitch = async (orgId: number) => {
    if (orgId === activeOrganization?.id) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      await switchWorkspace(orgId);
      // Store active org in localStorage for API service
      localStorage.setItem('activeOrganizationId', orgId.toString());
      // Refresh the page to reload data with new workspace context
      window.location.reload();
    } catch (error) {
      console.error('Failed to switch workspace:', error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  // Sync localStorage on mount
  useEffect(() => {
    if (activeOrganization?.id) {
      localStorage.setItem('activeOrganizationId', activeOrganization.id.toString());
    }
  }, [activeOrganization?.id]);

  const getWorkspaceIcon = (org: typeof activeOrganization) => {
    if (!org) return <Building2 className="w-5 h-5" aria-hidden="true" />;

    if (org.settings?.isPersonal) {
      return <User className="w-5 h-5 text-blue-500" aria-hidden="true" />;
    }

    if (org.logoUrl) {
      return (
        <img
          src={org.logoUrl}
          alt={org.name}
          className="w-5 h-5 rounded object-cover"
          width={20}
          height={20}
        />
      );
    }

    // Return initials
    const initials = org.name.substring(0, 2).toUpperCase();
    return (
      <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
        {initials}
      </div>
    );
  };

  if (!activeOrganization) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors min-w-[180px]"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Switch workspace"
      >
        {getWorkspaceIcon(activeOrganization)}
        <span className="font-medium text-foreground truncate max-w-[140px]">
          {activeOrganization.settings?.isPersonal
            ? 'Personal'
            : activeOrganization.name}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-background rounded-lg shadow-lg border border-border py-1 z-50">
          {/* Header */}
          <div className="px-3 py-2 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Workspaces
            </p>
          </div>

          {/* Workspace List */}
          <div className="max-h-64 overflow-y-auto">
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => handleSwitch(org.id)}
                disabled={isLoading}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent transition-colors"
              >
                {getWorkspaceIcon(org)}
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground truncate">
                    {org.settings?.isPersonal ? 'Personal Workspace' : org.name}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {org.role || 'member'}
                  </p>
                </div>
                {activeOrganization.id === org.id && (
                  <Check className="w-4 h-4 text-green-500" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-border pt-1">
            {/* Invite Members - only show for non-personal workspaces where user is admin/owner */}
            {!activeOrganization.settings?.isPersonal && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsInviteModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent transition-colors text-muted-foreground"
              >
                <UserPlus className="w-5 h-5" aria-hidden="true" />
                <span>Invite Members</span>
              </button>
            )}
            <button
              onClick={() => {
                setIsOpen(false);
                setIsCreateModalOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent transition-colors text-muted-foreground"
            >
              <Plus className="w-5 h-5" aria-hidden="true" />
              <span>Create Workspace</span>
            </button>
          </div>
        </div>
      )}

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Invite to Workspace Modal */}
      <InviteToWorkspaceModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default WorkspaceSwitcher;
