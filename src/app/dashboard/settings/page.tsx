"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/authProvider";
import { fetchAuthSession, signInWithRedirect } from 'aws-amplify/auth';
import { toast } from "sonner";
import { SubscriptionDashboard } from "@/components/subscription/SubscriptionDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Edit, Key, Shield, User, Mail, Users, Settings as SettingsIcon, Building2, Crown, UserMinus, Loader2, AlertTriangle, LogOut, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import InviteToWorkspaceModal from "@/components/InviteToWorkspaceModal";

// Types for workspace data
interface WorkspaceMember {
  odId: number;
  odUserId: number;
  organizationId: number;
  userId: number;
  role: string;
  status: string;
  joinedAt: string;
  user: {
    userId: number;
    username: string;
    email: string;
    profilePictureUrl?: string;
  };
}

interface WorkspaceData {
  id: number;
  name: string;
  description?: string;
  slug: string;
  logoUrl?: string;
  settings?: {
    isPersonal?: boolean;
  };
}

const SettingsPage = () => {
  const { user, activeOrganization, refreshAuth } = useAuth();

  // Check if user is authenticated via Google OAuth
  const isGoogleAuth = user?.sub?.includes('-') || false; // Cognito IDs have hyphens

  const userSettings = {
    username: user?.preferred_username || user?.username || "Not available",
    email: user?.email || "Not available",
    teamName: "Development Team",
    roleName: "Developer",
  };

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileForm, setProfileForm] = useState({
    username: userSettings.username,
    email: userSettings.email,
    teamName: userSettings.teamName,
    roleName: userSettings.roleName,
  });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Workspace state
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData | null>(null);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(true);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [isEditWorkspaceOpen, setIsEditWorkspaceOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [workspaceForm, setWorkspaceForm] = useState({ name: '', description: '' });
  const [isSavingWorkspace, setIsSavingWorkspace] = useState(false);
  const [isLeavingWorkspace, setIsLeavingWorkspace] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>('member');

  // Get auth headers helper
  const getAuthHeaders = async (): Promise<HeadersInit> => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
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
    return headers;
  };

  // Fetch workspace data and members
  useEffect(() => {
    const fetchWorkspaceData = async () => {
      if (!activeOrganization?.id) {
        setIsWorkspaceLoading(false);
        return;
      }

      setIsWorkspaceLoading(true);
      setWorkspaceError(null);

      try {
        const headers = await getAuthHeaders();
        const orgId = activeOrganization.id;

        // Fetch workspace details and members in parallel
        const [orgResponse, membersResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/organizations/${orgId}`, {
            credentials: 'include',
            headers,
          }),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/organizations/${orgId}/members`, {
            credentials: 'include',
            headers,
          }),
        ]);

        if (orgResponse.ok) {
          const orgData = await orgResponse.json();
          if (orgData.success) {
            setWorkspaceData(orgData.data);
            setWorkspaceForm({
              name: orgData.data.name || '',
              description: orgData.data.description || '',
            });
          }
        }

        if (membersResponse.ok) {
          const membersData = await membersResponse.json();
          if (membersData.success) {
            setWorkspaceMembers(membersData.data || []);
            // Find current user's role
            const currentMember = membersData.data?.find(
              (m: WorkspaceMember) => m.user?.email?.toLowerCase() === user?.email?.toLowerCase()
            );
            if (currentMember) {
              setCurrentUserRole(currentMember.role);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching workspace data:', error);
        setWorkspaceError('Failed to load workspace data');
      } finally {
        setIsWorkspaceLoading(false);
      }
    };

    fetchWorkspaceData();
  }, [activeOrganization?.id, user?.email]);

  // Handle workspace update
  const handleWorkspaceUpdate = async () => {
    if (!activeOrganization?.id || !workspaceForm.name.trim()) return;

    setIsSavingWorkspace(true);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/organizations/${activeOrganization.id}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers,
          body: JSON.stringify({
            name: workspaceForm.name.trim(),
            description: workspaceForm.description.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setWorkspaceData(data.data);
        setIsEditWorkspaceOpen(false);
        await refreshAuth();
      } else {
        setWorkspaceError(data.message || 'Failed to update workspace');
      }
    } catch (error) {
      console.error('Error updating workspace:', error);
      setWorkspaceError('Failed to update workspace');
    } finally {
      setIsSavingWorkspace(false);
    }
  };

  // Handle leave workspace
  const handleLeaveWorkspace = async () => {
    if (!activeOrganization?.id) return;

    setIsLeavingWorkspace(true);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/organizations/${activeOrganization.id}/leave`,
        {
          method: 'POST',
          credentials: 'include',
          headers,
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setIsLeaveDialogOpen(false);
        await refreshAuth();
        window.location.href = '/dashboard';
      } else {
        setWorkspaceError(data.message || 'Failed to leave workspace');
      }
    } catch (error) {
      console.error('Error leaving workspace:', error);
      setWorkspaceError('Failed to leave workspace');
    } finally {
      setIsLeavingWorkspace(false);
    }
  };

  // Get role badge variant
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge className="bg-gray-800 hover:bg-gray-900"><Crown className="h-3 w-3 mr-1" />Owner</Badge>;
      case 'admin':
        return <Badge className="bg-gray-600 hover:bg-gray-700"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
      default:
        return <Badge variant="secondary"><User className="h-3 w-3 mr-1" />Member</Badge>;
    }
  };

  const isPersonalWorkspace = activeOrganization?.settings?.isPersonal;
  const canEditWorkspace = currentUserRole === 'owner' || currentUserRole === 'admin';
  const canInviteMembers = (currentUserRole === 'owner' || currentUserRole === 'admin') && !isPersonalWorkspace;

  const handlePasswordChange = async () => {
    setPasswordErrors([]);
    
    // Validation
    const errors: string[] = [];
    if (!passwordForm.currentPassword) errors.push("Current password is required");
    if (!passwordForm.newPassword) errors.push("New password is required");
    if (passwordForm.newPassword.length < 8) errors.push("New password must be at least 8 characters");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) errors.push("Passwords do not match");
    
    if (errors.length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    setIsPasswordLoading(true);
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPasswordErrors([data.message || data.error || "Failed to change password. Please try again."]);
        return;
      }
      
      // Reset form and close dialog
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsPasswordDialogOpen(false);
      
      // Show success toast
      toast.success("Password changed successfully!");
    } catch (error) {
      setPasswordErrors(["Failed to change password. Please try again."]);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setIsProfileLoading(true);
    
    try {
      if (!user?.userId) {
        console.error("No user ID found");
        return;
      }

      const headers = await getAuthHeaders();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${user.userId}/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          username: profileForm.username,
          email: profileForm.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to update profile. Please try again.");
        return;
      }
      
      setIsProfileDialogOpen(false);
      
      // Refresh auth context to get updated user data
      await refreshAuth();
      
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleGoogleConnect = async () => {
    try {
      // Initiate Google OAuth sign-in through Cognito
      // This will redirect the user to Google for authentication
      await signInWithRedirect({
        provider: { custom: 'Google' }
      });
      
      // Note: The page will redirect, so code below won't execute immediately
      // The OAuthCallbackPage will handle the response
    } catch (error) {
      console.error("Failed to initiate Google authentication:", error);
      toast.error("Failed to initiate Google authentication. Please try again.");
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-4 sm:p-6 space-y-6 sm:space-y-8">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Separator />

      {/* User Profile Section */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
            Profile Information
          </CardTitle>
          <CardDescription className="text-sm">
            Your basic account information and profile details
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Username</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-muted rounded-md text-sm">
                  {userSettings.username}
                </div>
                <Badge variant="outline" className="gap-1">
                  <User className="h-3 w-3" />
                  Active
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Email Address</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-muted rounded-md text-sm">
                  {userSettings.email}
                </div>
                <Badge variant="outline" className="gap-1">
                  <Mail className="h-3 w-3" />
                  Verified
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Team</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-muted rounded-md text-sm">
                  {userSettings.teamName}
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Users className="h-3 w-3" />
                  Member
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Role</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-muted rounded-md text-sm">
                  {userSettings.roleName}
                </div>
                <Badge variant="secondary" className="gap-1">
                  <SettingsIcon className="h-3 w-3" />
                  Standard
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Update your profile information
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-username">Username</Label>
                    <Input
                      id="edit-username"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Enter username"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-team">Team</Label>
                    <Input
                      id="edit-team"
                      value={profileForm.teamName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, teamName: e.target.value }))}
                      placeholder="Enter team name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-role">Role</Label>
                    <Input
                      id="edit-role"
                      value={profileForm.roleName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, roleName: e.target.value }))}
                      placeholder="Enter role"
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsProfileDialogOpen(false);
                      setProfileForm({
                        username: userSettings.username,
                        email: userSettings.email,
                        teamName: userSettings.teamName,
                        roleName: userSettings.roleName,
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleProfileUpdate}
                    disabled={isProfileLoading}
                  >
                    {isProfileLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
            Security & Authentication
          </CardTitle>
          <CardDescription className="text-sm">
            Manage your password and authentication methods
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-6">
          {/* Password Change */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Password</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Change your account password to keep your account secure
              </p>
              
              <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Key className="h-4 w-4" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                      Enter your current password and choose a new one
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter current password"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm new password"
                      />
                    </div>
                    
                    {passwordErrors.length > 0 && (
                      <div className="space-y-1">
                        {passwordErrors.map((error, index) => (
                          <p key={index} className="text-sm text-destructive">
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsPasswordDialogOpen(false);
                        setPasswordForm({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                        setPasswordErrors([]);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handlePasswordChange}
                      disabled={isPasswordLoading}
                    >
                      {isPasswordLoading ? "Changing..." : "Change Password"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <Separator />
            
            {/* Google Authentication */}
            <div>
              <h4 className="text-sm font-medium mb-2">Google Authentication</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your Google account for easier sign-in and enhanced security
              </p>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    isGoogleAuth ? "bg-gray-100" : "bg-gray-100"
                  )}>
                    <svg className={cn(
                      "w-4 h-4",
                      isGoogleAuth ? "text-gray-600" : "text-gray-600"
                    )} viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Google Account</p>
                    <p className="text-xs text-muted-foreground">
                      {isGoogleAuth ? `Connected - ${userSettings.email}` : "Not connected"}
                    </p>
                  </div>
                </div>

                {isGoogleAuth ? (
                  <Badge variant="outline" className="gap-1 text-gray-600 border-gray-600">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Connected
                  </Badge>
                ) : (
                  <Button onClick={handleGoogleConnect} variant="outline" size="sm">
                    Connect
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workspace Settings */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
            Workspace Settings
          </CardTitle>
          <CardDescription className="text-sm">
            Manage your current workspace settings and members
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-6">
          {isWorkspaceLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : workspaceError ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{workspaceError}</AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Workspace Info */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-semibold">{workspaceData?.name || activeOrganization?.name}</h3>
                      {isPersonalWorkspace && (
                        <Badge variant="outline">Personal</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {workspaceData?.description || 'No description'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Your role: {getRoleBadge(currentUserRole)}
                    </p>
                  </div>
                  {canEditWorkspace && !isPersonalWorkspace && (
                    <Dialog open={isEditWorkspaceOpen} onOpenChange={setIsEditWorkspaceOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
                        <DialogHeader>
                          <DialogTitle>Edit Workspace</DialogTitle>
                          <DialogDescription>
                            Update your workspace name and description
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="workspace-name">Workspace Name</Label>
                            <Input
                              id="workspace-name"
                              value={workspaceForm.name}
                              onChange={(e) => setWorkspaceForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Enter workspace name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="workspace-description">Description</Label>
                            <Textarea
                              id="workspace-description"
                              value={workspaceForm.description}
                              onChange={(e) => setWorkspaceForm(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Enter workspace description (optional)"
                              rows={3}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsEditWorkspaceOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleWorkspaceUpdate} disabled={isSavingWorkspace || !workspaceForm.name.trim()}>
                            {isSavingWorkspace ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              'Save Changes'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>

              <Separator />

              {/* Members Section */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-medium">Members</h4>
                    <p className="text-xs text-muted-foreground">
                      {workspaceMembers.length} member{workspaceMembers.length !== 1 ? 's' : ''} in this workspace
                    </p>
                  </div>
                  {canInviteMembers && (
                    <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto" onClick={() => setIsInviteModalOpen(true)}>
                      <UserPlus className="h-4 w-4" />
                      Invite
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  {workspaceMembers.map((member) => (
                    <div
                      key={member.odId || member.userId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border bg-card gap-2"
                    >
                      <div className="flex items-center gap-3">
                        {member.user?.profilePictureUrl ? (
                          <img
                            src={`https://pm-s3-images.s3.us-east-1.amazonaws.com/${member.user.profilePictureUrl}`}
                            alt={member.user.username}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {member.user?.username?.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{member.user?.username || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{member.user?.email}</p>
                        </div>
                      </div>
                      {getRoleBadge(member.role)}
                    </div>
                  ))}

                  {workspaceMembers.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No members found
                    </p>
                  )}
                </div>
              </div>

              {/* Leave Workspace Section - Only show for non-personal workspaces and non-owners */}
              {!isPersonalWorkspace && currentUserRole !== 'owner' && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-destructive">Danger Zone</h4>
                      <p className="text-xs text-muted-foreground">
                        Leave this workspace. You'll lose access to all projects and tasks.
                      </p>
                    </div>
                    <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="gap-2">
                          <LogOut className="h-4 w-4" />
                          Leave Workspace
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
                        <DialogHeader>
                          <DialogTitle>Leave Workspace</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to leave "{workspaceData?.name}"? You'll lose access to all projects and tasks in this workspace.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                          <Button variant="outline" onClick={() => setIsLeaveDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={handleLeaveWorkspace} disabled={isLeavingWorkspace}>
                            {isLeavingWorkspace ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Leaving...
                              </>
                            ) : (
                              'Leave Workspace'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Invite Modal */}
      <InviteToWorkspaceModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      {/* Subscription Settings */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl font-semibold">Subscription & Billing</CardTitle>
          <CardDescription className="text-sm">
            Manage your subscription plan and billing information. Billing is handled directly in TaskLuid{' '}
            <a
              href={import.meta.env.VITE_BILLING_MANAGE_URL || import.meta.env.VITE_BILLING_URL || '/pricing'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Billing Portal
            </a>.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <SubscriptionDashboard />
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
