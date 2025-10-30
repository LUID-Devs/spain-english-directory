"use client";
import { useGetUsersWithStatsQuery, useInviteUserMutation, useUpdateUserRoleMutation, UserWithStats } from "@/state/api";
import React, { useState } from "react";
import { useAppSelector } from "@/app/redux";
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
import Image from "next/image";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";

const CustomToolBar = () => (
  <GridToolbarContainer className="toolbar flex gap-2">
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);

const columns: GridColDef[] = [
  { field: "userId", headerName: "ID", width: 100 },
  { field: "username", headerName: "Username", width: 150 },
  {
    field: "profilePictureUrl",
    headerName: "Profile Picture",
    width: 100,
    renderCell: (params) => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-9 w-9">
          <Image
            src={`https://pm-s3-images.s3.us-east-1.amazonaws.com/${params.value}`}
            alt={params.row.username}
            width={100}
            height={50}
            className="h-full rounded-full object-cover"
          />
        </div>
      </div>
    ),
  },
];

const Users = () => {
  const { data: users, isLoading, isError } = useGetUsersWithStatsQuery();
  const [inviteUser] = useInviteUserMutation();
  const [updateUserRole] = useUpdateUserRoleMutation();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);

  const handleInviteUser = async (invitationData: {
    email: string;
    teamId: number;
    role: string;
  }) => {
    try {
      await inviteUser(invitationData).unwrap();
      alert("Invitation sent successfully!");
    } catch (error) {
      console.error("Failed to send invitation:", error);
      throw error;
    }
  };

  const handleManageRole = (user: UserWithStats) => {
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      await updateUserRole({ userId, role: newRole }).unwrap();
      alert("User role updated successfully!");
    } catch (error) {
      console.error("Failed to update user role:", error);
      throw error;
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError || !users) return <div>Error fetching users</div>;

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

export default Users;