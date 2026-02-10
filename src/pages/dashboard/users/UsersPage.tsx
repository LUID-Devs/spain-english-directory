import { useGetUsersWithStatsQuery, useInviteUserMutation, useUpdateUserRoleMutation, useRemoveOrganizationMemberMutation, UserWithStats } from "@/hooks/useApi";
import { useUserStore } from "@/stores/userStore";
import React, { useState } from "react";
import UserCard from "@/components/UserCard";
import InviteUserModal from "@/components/InviteUserModal";
import RoleManagementModal from "@/components/RoleManagementModal";
import {
  Users,
  Search,
  Plus,
  Settings,
  Grid3X3,
  List,
  UserPlus,
  Trash2,
  MoreVertical,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const getRoleBadge = (role: string) => {
  const roleMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    'admin': { variant: 'destructive', label: 'Admin' },
    'project_manager': { variant: 'default', label: 'Project Manager' },
    'member': { variant: 'secondary', label: 'Member' },
    'viewer': { variant: 'outline', label: 'Viewer' },
  };
  return roleMap[role] || roleMap['member'];
};

const UsersPage = () => {
  const { data: users, isLoading, isError, refetch } = useGetUsersWithStatsQuery();
  const [inviteUser] = useInviteUserMutation();
  const [updateUserRole] = useUpdateUserRoleMutation();
  const [removeOrganizationMember] = useRemoveOrganizationMemberMutation();
  const { currentUser } = useUserStore();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Get current organization ID
  const currentOrganizationId = currentUser?.activeOrganizationId || 
    (typeof window !== 'undefined' ? Number(localStorage.getItem('activeOrganizationId')) : null);

  const handleManageRole = (user: UserWithStats) => {
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  };

  const handleRemoveMember = (user: UserWithStats) => {
    setSelectedUser(user);
    setIsRemoveDialogOpen(true);
  };

  const confirmRemoveMember = async () => {
    if (!selectedUser || !currentOrganizationId) return;
    
    try {
      await removeOrganizationMember({ 
        organizationId: currentOrganizationId, 
        userId: selectedUser.userId 
      }).unwrap();
      
      // Refetch users list
      refetch();
      setIsRemoveDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  // Filter users based on search query
  const filteredUsers = users?.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.teamName?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
            <p className="text-muted-foreground">Manage and organize your team</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading team members...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !users) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
            <p className="text-muted-foreground">Manage and organize your team</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Error loading team members. Please try again.
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()}
              className="ml-4"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {filteredUsers.length} member{filteredUsers.length !== 1 ? 's' : ''} in your organization
          </p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)} className="w-full sm:w-auto">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "cards" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("cards")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Display */}
      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              No Team Members Found
            </h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              {searchQuery ? 
                `No members found matching "${searchQuery}"` :
                "Invite your first team member to get started with collaboration."
              }
            </p>
            {searchQuery ? (
              <Button
                onClick={() => setSearchQuery('')}
                variant="outline"
              >
                Clear Search
              </Button>
            ) : (
              <Button onClick={() => setIsInviteModalOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Your First Member
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'cards' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <UserCard 
              key={user.userId} 
              user={user} 
              showStats={true} 
              onManageRole={handleManageRole}
              onRemoveMember={handleRemoveMember}
              canRemove={currentUser?.userId !== user.userId}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Manage roles and view member statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            {/* Mobile: Card-based layout */}
            <div className="sm:hidden divide-y divide-border">
              {filteredUsers.map((user) => {
                const roleBadge = getRoleBadge(user.role || 'member');
                return (
                  <div key={user.userId} className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={user.profilePictureUrl
                          ? `https://pm-s3-images.s3.us-east-1.amazonaws.com/${user.profilePictureUrl}`
                          : `https://pm-s3-images.s3.us-east-1.amazonaws.com/p1.jpeg`
                        }
                        alt={user.username}
                        className="h-10 w-10 rounded-full border-2 border-border object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">{user.username}</div>
                        <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <Badge variant={roleBadge.variant} className="text-xs">{roleBadge.label}</Badge>
                      {user.teamName && (
                        <Badge variant="outline" className="text-xs">{user.teamName}</Badge>
                      )}
                    </div>
                    {user.taskStats && (
                      <div className="flex gap-4 text-xs mb-3">
                        <div className="text-center">
                          <div className="font-semibold text-primary">{user.taskStats.authored}</div>
                          <div className="text-muted-foreground">Created</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{user.taskStats.completed}</div>
                          <div className="text-muted-foreground">Done</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-red-600">{user.taskStats.overdue}</div>
                          <div className="text-muted-foreground">Overdue</div>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManageRole(user)}
                        className="flex-1"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Manage Role
                      </Button>
                      {currentUser?.userId !== user.userId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveMember(user)}
                          className="text-red-600 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: Table layout */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Task Stats</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const roleBadge = getRoleBadge(user.role || 'member');
                    return (
                      <TableRow key={user.userId}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img
                                src={user.profilePictureUrl
                                  ? `https://pm-s3-images.s3.us-east-1.amazonaws.com/${user.profilePictureUrl}`
                                  : `https://pm-s3-images.s3.us-east-1.amazonaws.com/p1.jpeg`
                                }
                                alt={user.username}
                                className="h-10 w-10 rounded-full border-2 border-border object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-foreground truncate">
                                {user.username}
                              </div>
                              <div className="text-sm text-muted-foreground truncate">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={roleBadge.variant} className="text-xs">
                            {roleBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.teamName ? (
                            <Badge variant="outline" className="text-xs">
                              {user.teamName}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">No team</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.taskStats ? (
                            <div className="flex space-x-4 text-xs">
                              <div className="text-center">
                                <div className="font-semibold text-primary">{user.taskStats.authored}</div>
                                <div className="text-muted-foreground">Created</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold text-green-600">{user.taskStats.completed}</div>
                                <div className="text-muted-foreground">Done</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold text-red-600">{user.taskStats.overdue}</div>
                                <div className="text-muted-foreground">Overdue</div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No data</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleManageRole(user)}>
                                <Settings className="h-4 w-4 mr-2" />
                                Manage Role
                              </DropdownMenuItem>
                              {currentUser?.userId !== user.userId && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleRemoveMember(user)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove Member
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      {filteredUsers.length > 0 && (
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            Showing {filteredUsers.length} of {users.length} team members
          </p>
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

      {/* Remove Member Confirmation Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Remove Team Member
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{selectedUser?.username}</strong> from the organization?
              This action cannot be undone. The user will lose access to all projects and tasks.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsRemoveDialogOpen(false); setSelectedUser(null); }}>
              Cancel
            </Button>
            <Button
              onClick={confirmRemoveMember}
              variant="destructive"
            >
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;