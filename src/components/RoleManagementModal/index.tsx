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
  { value: "viewer", label: "Viewer", description: "Can view projects and tasks" },
  { value: "member", label: "Member", description: "Can create and edit tasks, comment on projects" },
  { value: "project_manager", label: "Project Manager", description: "Can manage projects and assign tasks" },
  { value: "admin", label: "Admin", description: "Full access to all features and settings" },
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Manage User Role">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <img
              src={user.profilePictureUrl 
                ? `https://pm-s3-images.s3.us-east-1.amazonaws.com/${user.profilePictureUrl}`
                : `https://pm-s3-images.s3.us-east-1.amazonaws.com/p1.jpeg`
              }
              alt={`${user.username}'s profile`}
              className="h-12 w-12 rounded-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {user.username}
              </h3>
              {user.role && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  Current: {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Select Role
            </label>
            <div className="space-y-3">
              {roles.map((role) => (
                <div
                  key={role.value}
                  className={`relative rounded-lg border p-4 cursor-pointer transition-colors ${
                    selectedRole === role.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setSelectedRole(role.value)}
                >
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={selectedRole === role.value}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <label className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                        {role.label}
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {role.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 dark:bg-yellow-900/20 dark:border-yellow-700">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Changing a user's role will immediately affect their permissions and access to features.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? "Updating..." : "Update Role"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default RoleManagementModal;