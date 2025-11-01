import React, { useState } from "react";
import Modal from "@/components/Modal";
import { UserWithStats } from "@/hooks/useApi";

interface RoleManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserWithStats | null;
  onUpdateRole: (userId: number, newRole: string) => Promise<void>;
}

const roles = [
  { 
    value: "viewer", 
    label: "Viewer", 
    description: "Can view projects and tasks",
    icon: "👁️",
    color: "from-gray-400 to-gray-500"
  },
  { 
    value: "member", 
    label: "Member", 
    description: "Can create and edit tasks, comment on projects",
    icon: "👤",
    color: "from-blue-500 to-blue-600"
  },
  { 
    value: "project_manager", 
    label: "Project Manager", 
    description: "Can manage projects and assign tasks",
    icon: "🎯",
    color: "from-purple-500 to-purple-600"
  },
  { 
    value: "admin", 
    label: "Admin", 
    description: "Full access to all features and settings",
    icon: "👑",
    color: "from-red-500 to-red-600"
  },
];

const RoleManagementModal = ({ isOpen, onClose, user, onUpdateRole }: RoleManagementModalProps) => {
  const [selectedRole, setSelectedRole] = useState("member");
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (user) {
      // Set the current user's role or default to member
      setSelectedRole(user.role || "member");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setIsSubmitting(true);
    
    try {
      await onUpdateRole(user.userId, selectedRole);
      onClose();
    } catch (error) {
      console.error("Error updating user role:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  const currentRole = roles.find(role => role.value === user.role);

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Manage User Role">
      <div className="space-y-6">
        {/* User Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 p-6 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={user.profilePictureUrl 
                  ? `https://pm-s3-images.s3.us-east-1.amazonaws.com/${user.profilePictureUrl}`
                  : `https://pm-s3-images.s3.us-east-1.amazonaws.com/p1.jpeg`
                }
                alt={`${user.username}'s profile`}
                className="h-16 w-16 rounded-full border-3 border-white object-cover shadow-lg dark:border-gray-700"
              />
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white bg-green-400 dark:border-gray-800" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {user.username}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user.email}
              </p>
              {currentRole && (
                <div className="mt-2">
                  <span className={`inline-flex items-center space-x-1 rounded-full bg-gradient-to-r ${currentRole.color} px-3 py-1 text-xs font-medium text-white shadow-sm`}>
                    <span>{currentRole.icon}</span>
                    <span>Current: {currentRole.label}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Select New Role
            </label>
            <div className="grid gap-3">
              {roles.map((role) => (
                <div
                  key={role.value}
                  className={`group relative cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                    selectedRole === role.value
                      ? "border-blue-500 bg-blue-50 shadow-md dark:bg-blue-900/20"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-700/50"
                  }`}
                  onClick={() => setSelectedRole(role.value)}
                >
                  <div className="flex items-center p-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={selectedRole === role.value}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                      />
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r ${role.color} text-white shadow-sm`}>
                          <span className="text-lg">{role.icon}</span>
                        </span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                              {role.label}
                            </span>
                            {selectedRole === role.value && (
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                Selected
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {role.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {selectedRole === role.value && (
                      <div className="ml-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:border-amber-700 dark:from-amber-900/20 dark:to-orange-900/20">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                  <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  Role Change Notice
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Changing this user's role will immediately update their permissions and access to features across the platform.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedRole === user.role}
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Updating...</span>
                </div>
              ) : (
                `Update to ${roles.find(r => r.value === selectedRole)?.label || 'Role'}`
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default RoleManagementModal;