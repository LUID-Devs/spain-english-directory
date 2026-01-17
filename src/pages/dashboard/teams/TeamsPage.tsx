import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/authProvider";
import { fetchAuthSession } from 'aws-amplify/auth';
import {
  Users,
  Search,
  UserPlus,
  Crown,
  Shield,
  User,
  Mail,
  MoreVertical,
  Loader2,
  Building2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import InviteToWorkspaceModal from "@/components/InviteToWorkspaceModal";

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

const TeamsPage = () => {
  const { activeOrganization, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>('member');

  const isPersonalWorkspace = activeOrganization?.settings?.isPersonal;

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
      console.log('No Cognito session');
    }
    return headers;
  };

  // Fetch workspace members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!activeOrganization?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const headers = await getAuthHeaders();
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/organizations/${activeOrganization.id}/members`,
          {
            credentials: 'include',
            headers,
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setMembers(data.data || []);
            // Find current user's role
            const currentMember = data.data?.find(
              (m: WorkspaceMember) => m.user?.email?.toLowerCase() === user?.email?.toLowerCase()
            );
            if (currentMember) {
              setCurrentUserRole(currentMember.role);
            }
          }
        } else {
          setError('Failed to load members');
        }
      } catch (err) {
        console.error('Error fetching members:', err);
        setError('Failed to load members');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [activeOrganization?.id, user?.email]);

  // Filter members by search query
  const filteredMembers = members.filter(member => {
    const searchLower = searchQuery.toLowerCase();
    return (
      member.user?.username?.toLowerCase().includes(searchLower) ||
      member.user?.email?.toLowerCase().includes(searchLower) ||
      member.role?.toLowerCase().includes(searchLower)
    );
  });

  // Get role badge
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return (
          <Badge className="bg-gray-800 hover:bg-gray-900 gap-1">
            <Crown className="h-3 w-3" />
            Owner
          </Badge>
        );
      case 'admin':
        return (
          <Badge className="bg-gray-600 hover:bg-gray-700 gap-1">
            <Shield className="h-3 w-3" />
            Admin
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <User className="h-3 w-3" />
            Member
          </Badge>
        );
    }
  };

  // Stats
  const stats = {
    total: members.length,
    owners: members.filter(m => m.role === 'owner').length,
    admins: members.filter(m => m.role === 'admin').length,
    members: members.filter(m => m.role === 'member').length,
  };

  const canInvite = (currentUserRole === 'owner' || currentUserRole === 'admin') && !isPersonalWorkspace;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground">Manage your workspace team</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Loading members...</p>
            </div>
          </CardContent>
        </Card>
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
            {isPersonalWorkspace
              ? "Personal workspace - only you have access"
              : `Manage members of ${activeOrganization?.name || 'your workspace'}`
            }
          </p>
        </div>
        {canInvite && (
          <Button onClick={() => setIsInviteModalOpen(true)} className="gap-2 w-full sm:w-auto">
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Team Overview</CardTitle>
          </div>
          <CardDescription>
            {activeOrganization?.name || 'Workspace'} membership summary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center bg-primary/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total Members</div>
            </div>
            <div className="text-center bg-gray-100 dark:bg-gray-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.owners}</div>
              <div className="text-xs text-muted-foreground">Owners</div>
            </div>
            <div className="text-center bg-gray-100 dark:bg-gray-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.admins}</div>
              <div className="text-xs text-muted-foreground">Admins</div>
            </div>
            <div className="text-center bg-muted rounded-lg p-4">
              <div className="text-2xl font-bold text-muted-foreground">{stats.members}</div>
              <div className="text-xs text-muted-foreground">Members</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members
          </CardTitle>
          <CardDescription>
            {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                {searchQuery ? 'No members found' : 'No team members yet'}
              </h3>
              <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                {searchQuery
                  ? `No members match "${searchQuery}"`
                  : isPersonalWorkspace
                    ? "This is your personal workspace"
                    : "Invite team members to collaborate on projects"
                }
              </p>
              {!searchQuery && canInvite && (
                <Button onClick={() => setIsInviteModalOpen(true)} className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Invite Your First Member
                </Button>
              )}
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMembers.map((member) => (
                <div
                  key={member.odId || member.userId}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {member.user?.profilePictureUrl ? (
                      <img
                        src={`https://pm-s3-images.s3.us-east-1.amazonaws.com/${member.user.profilePictureUrl}`}
                        alt={member.user.username}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                        <span className="text-white text-lg font-medium">
                          {member.user?.username?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{member.user?.username || 'Unknown'}</p>
                        {member.user?.email?.toLowerCase() === user?.email?.toLowerCase() && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {member.user?.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getRoleBadge(member.role)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Modal */}
      <InviteToWorkspaceModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
};

export default TeamsPage;
