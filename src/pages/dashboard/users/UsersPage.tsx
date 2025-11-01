import { useGetUsersWithStatsQuery, useInviteUserMutation, useUpdateUserRoleMutation, UserWithStats } from "@/hooks/useApi";
import React, { useState } from "react";
import { useGlobalStore } from "@/stores/globalStore";
import Header from "@/components/Header";
import UserCard from "@/components/UserCard";
import InviteUserModal from "@/components/InviteUserModal";
import RoleManagementModal from "@/components/RoleManagementModal";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";

import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";

const CustomToolBar = () => (
  <GridToolbarContainer className="toolbar flex gap-2">
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);

const getRoleBadgeProps = (role: string) => {
  const roleMap: Record<string, { bg: string; text: string; label: string }> = {
    'admin': { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-800 dark:text-red-200', label: 'Admin' },
    'project_manager': { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-800 dark:text-purple-200', label: 'Project Manager' },
    'member': { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-800 dark:text-blue-200', label: 'Member' },
    'viewer': { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200', label: 'Viewer' },
  };
  return roleMap[role] || roleMap['member'];
};

const UsersPage = () => {
  const { data: users, isLoading, isError } = useGetUsersWithStatsQuery();
  const [inviteUser] = useInviteUserMutation();
  const [updateUserRole] = useUpdateUserRoleMutation();
  const isDarkMode = useGlobalStore().isDarkMode;
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);

  const handleManageRole = (user: UserWithStats) => {
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  };

  const columns: GridColDef[] = [
    { field: "userId", headerName: "ID", width: 80 },
    {
      field: "user",
      headerName: "User",
      width: 250,
      renderCell: (params) => (
        <div className="flex items-center space-x-3 py-2">
          <div className="h-10 w-10 flex-shrink-0">
            <img
              src={params.row.profilePictureUrl 
                ? `https://pm-s3-images.s3.us-east-1.amazonaws.com/${params.row.profilePictureUrl}`
                : `https://pm-s3-images.s3.us-east-1.amazonaws.com/p1.jpeg`
              }
              alt={params.row.username}
              className="h-10 w-10 rounded-full border-2 border-gray-200 object-cover dark:border-gray-600"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {params.row.username}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {params.row.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      field: "role",
      headerName: "Role",
      width: 150,
      renderCell: (params) => {
        const roleProps = getRoleBadgeProps(params.value || 'member');
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleProps.bg} ${roleProps.text}`}>
            {roleProps.label}
          </span>
        );
      },
    },
    {
      field: "teamName",
      headerName: "Team",
      width: 150,
      renderCell: (params) => (
        params.value ? (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-200">
            {params.value}
          </span>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-500">No team</span>
        )
      ),
    },
    {
      field: "taskStats",
      headerName: "Task Stats",
      width: 200,
      renderCell: (params) => {
        const stats = params.value;
        if (!stats) return <span className="text-gray-400">No data</span>;
        
        return (
          <div className="flex space-x-3 text-xs">
            <div className="text-center">
              <div className="font-semibold text-blue-600 dark:text-blue-400">{stats.authored}</div>
              <div className="text-gray-500">Created</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600 dark:text-green-400">{stats.completed}</div>
              <div className="text-gray-500">Done</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-red-600 dark:text-red-400">{stats.overdue}</div>
              <div className="text-gray-500">Overdue</div>
            </div>
          </div>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <button
          onClick={() => handleManageRole(params.row)}
          className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
          title="Manage role"
        >
          <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Manage
        </button>
      ),
    },
  ];

  const handleInviteUser = async (invitationData: {
    email: string;
    teamId: number;
    role: string;
  }) => {
    try {
      await inviteUser(invitationData).unwrap();
      // Toast notification is handled in the mutation hook
    } catch (error) {
      console.error("Failed to send invitation:", error);
      throw error;
    }
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      await updateUserRole({ userId, role: newRole }).unwrap();
      // Toast notifications and optimistic updates are handled in the mutation hook
      setIsRoleModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to update user role:", error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex w-full flex-col p-8">
        <Header name="Team Members" />
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-600 dark:text-gray-400">Loading team members...</span>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !users) {
    return (
      <div className="flex w-full flex-col p-8">
        <Header name="Team Members" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-red-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Error loading users</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              There was a problem fetching the team members. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col p-8">
      <div className="mb-6 flex items-center justify-between">
        <Header name="Team Members" />
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'cards'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              } rounded-l-lg border-r border-gray-300 dark:border-gray-600`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'table'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              } rounded-r-lg`}
            >
              Table
            </button>
          </div>
          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Invite User
          </button>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <UserCard 
              key={user.userId} 
              user={user} 
              showStats={true} 
              onManageRole={handleManageRole}
            />
          ))}
        </div>
      ) : (
        <div style={{ height: 650, width: "100%" }}>
          <DataGrid
            rows={users || []}
            columns={columns}
            getRowId={(row) => row.userId}
            pagination
            slots={{
              toolbar: CustomToolBar,
            }}
            className={dataGridClassNames}
            sx={dataGridSxStyles(isDarkMode)}
          />
        </div>
      )}

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInviteUser}
      />

      <RoleManagementModal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onUpdateRole={handleUpdateRole}
      />
    </div>
  );
};

export default UsersPage;