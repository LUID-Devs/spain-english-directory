"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/authProvider";
import { SubscriptionDashboard } from "@/components/subscription/SubscriptionDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Key, Shield, User, Mail, Users, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const SettingsPage = () => {
  const { user } = useAuth();

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
      // TODO: Implement actual password change API call
      console.log("Password change requested", passwordForm);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form and close dialog
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsPasswordDialogOpen(false);
      
      // TODO: Show success toast
    } catch (error) {
      setPasswordErrors(["Failed to change password. Please try again."]);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setIsProfileLoading(true);
    
    try {
      // TODO: Implement actual profile update API call
      console.log("Profile update requested", profileForm);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsProfileDialogOpen(false);
      
      // TODO: Show success toast and update user data
    } catch (error) {
      console.error("Profile update error:", error);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleGoogleConnect = async () => {
    try {
      // TODO: Implement Google OAuth connection
      console.log("Google authentication requested");
      
      // For now, just show alert
      alert("Google authentication integration coming soon!");
    } catch (error) {
      console.error("Google authentication error:", error);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Separator />

      {/* User Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Your basic account information and profile details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <DialogContent className="sm:max-w-md">
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Authentication
          </CardTitle>
          <CardDescription>
            Manage your password and authentication methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
                <DialogContent className="sm:max-w-md">
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
                    isGoogleAuth ? "bg-green-100" : "bg-blue-100"
                  )}>
                    <svg className={cn(
                      "w-4 h-4",
                      isGoogleAuth ? "text-green-600" : "text-blue-600"
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
                  <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
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

      {/* Subscription Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Subscription & Billing</CardTitle>
          <CardDescription>
            Manage your subscription plan and billing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionDashboard />
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
