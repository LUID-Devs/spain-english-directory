import { useGetUsersWithStatsQuery, useInviteUserMutation, useUpdateUserRoleMutation, UserWithStats } from "@/hooks/useApi";
import React, { useState } from "react";
import { useGlobalStore } from "@/stores/globalStore";
import { toast } from "sonner";
import Header from "@/components/Header";
import UserCard from "@/components/UserCard";
import InviteUserModal from "@/components/InviteUserModal";
import RoleManagementModal from "@/components/RoleManagementModal";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";

import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { Users, Loader2, AlertCircle, UserPlus, Mail } from "lucide-react";

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
          <img
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
  const { data: users, isLoading, isError, refetch } = useGetUsersWithStatsQuery();
  const [inviteUser] = useInviteUserMutation();
  const [updateUserRole] = useUpdateUserRoleMutation();
  const isDarkMode = useGlobalStore().isDarkMode;
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
      toast.success("Invitation sent successfully!");
    } catch (error) {
      console.error("Failed to send invitation:", error);
      toast.error("Failed to send invitation. Please try again.");
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
      toast.success("User role updated successfully!");
    } catch (error) {
      console.error("Failed to update user role:", error);
      toast.error("Failed to update user role. Please try again.");
      throw error;
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
            <p className="text-muted-foreground">Manage team members and their roles</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Loading team members...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
            <p className="text-muted-foreground">Manage team members and their roles</p>
          </div>
          <Button onClick={() => setIsInviteModalOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </div>
        <EmptyState
          icon={AlertCircle}
          title="Failed to load team members"
          description="We couldn't load the team member list. Please try again."
          action={{
            label: "Try Again",
            onClick: () => refetch(),
          }}
        />
      </div>
    );
  }

  // Empty State - No Users
  if (!users || users.length === 0) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
            <p className="text-muted-foreground">Manage team members and their roles</p>
          </div>
        </div>
        <EmptyState
          icon={Users}
          title="No team members yet"
          description="Invite team members to collaborate on projects. They'll appear here once they join."
          action={{
            label: "Invite First Member",
            onClick: () => setIsInviteModalOpen(true),
          }}
        />
        <InviteUserModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onInvite={handleInviteUser}
        />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col p-8">
      <div className="mb-6 flex items-center justify-between">
        <Header name="Team Members" />
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg border border-border">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'cards'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-foreground hover:bg-accent'
              } rounded-l-lg border-r border-border`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'table'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-foreground hover:bg-accent'
              } rounded-r-lg`}
            >
              Table
            </button>
          </div>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
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
