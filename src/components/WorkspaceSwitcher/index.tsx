import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../app/authProvider';
import { ChevronDown, Check, Building2, User, Plus } from 'lucide-react';
import CreateWorkspaceModal from '../CreateWorkspaceModal';

const WorkspaceSwitcher: React.FC = () => {
  const { organizations, activeOrganization, switchWorkspace } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
    if (!org) return <Building2 className="w-5 h-5" />;

    if (org.settings?.isPersonal) {
      return <User className="w-5 h-5 text-blue-500" />;
    }

    if (org.logoUrl) {
      return (
        <img
          src={org.logoUrl}
          alt={org.name}
          className="w-5 h-5 rounded object-cover"
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
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-[180px]"
      >
        {getWorkspaceIcon(activeOrganization)}
        <span className="font-medium text-gray-900 dark:text-white truncate max-w-[140px]">
          {activeOrganization.settings?.isPersonal
            ? 'Personal'
            : activeOrganization.name}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          {/* Header */}
          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
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
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {getWorkspaceIcon(org)}
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {org.settings?.isPersonal ? 'Personal Workspace' : org.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {org.role || 'member'}
                  </p>
                </div>
                {activeOrganization.id === org.id && (
                  <Check className="w-4 h-4 text-green-500" />
                )}
              </button>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                setIsCreateModalOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
            >
              <Plus className="w-5 h-5" />
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

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center rounded-lg">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default WorkspaceSwitcher;
