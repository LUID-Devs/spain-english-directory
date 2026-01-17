import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/authProvider';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Loader2, CheckCircle, XCircle, Building2, UserPlus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface InviteDetails {
  id: number;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  organization: {
    id: number;
    name: string;
    logoUrl?: string;
  };
  inviter: {
    username: string;
    email: string;
    profilePictureUrl?: string;
  };
}

const InviteAcceptPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, refreshAuth } = useAuth();

  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch invite details
  useEffect(() => {
    const fetchInvite = async () => {
      if (!token) {
        setError('Invalid invite link');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/organizations/invites/${token}`
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setInvite(data.data);
        } else {
          setError(data.message || 'Invalid or expired invite');
        }
      } catch (err) {
        console.error('Error fetching invite:', err);
        setError('Failed to load invite details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvite();
  }, [token]);

  const handleAccept = async () => {
    if (!token || !isAuthenticated) return;

    setIsAccepting(true);
    setError(null);

    try {
      let headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

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

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/organizations/invites/${token}/accept`,
        {
          method: 'POST',
          credentials: 'include',
          headers,
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        // Refresh auth to get updated organizations
        await refreshAuth();
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(data.message || 'Failed to accept invite');
      }
    } catch (err) {
      console.error('Error accepting invite:', err);
      setError('An error occurred while accepting the invite');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleLogin = () => {
    // Store the invite token to process after login
    sessionStorage.setItem('pendingInviteToken', token || '');
    navigate('/auth/login');
  };

  const handleSignUp = () => {
    // Store the invite token to process after signup
    sessionStorage.setItem('pendingInviteToken', token || '');
    navigate('/auth/register');
  };

  // Loading state
  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading invite...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error && !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invalid Invite</h2>
            <p className="text-muted-foreground text-center mb-6">{error}</p>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Welcome to {invite?.organization.name}!</h2>
            <p className="text-muted-foreground text-center mb-4">
              You've successfully joined the workspace.
            </p>
            <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invite details
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {invite?.organization.logoUrl ? (
              <img
                src={invite.organization.logoUrl}
                alt={invite.organization.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-500 to-gray-500 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
          <CardTitle>You're Invited!</CardTitle>
          <CardDescription>
            {invite?.inviter.username} has invited you to join
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold">{invite?.organization.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              as a <span className="capitalize font-medium">{invite?.role}</span>
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          {isAuthenticated ? (
            // User is logged in
            <div className="space-y-4">
              {user?.email?.toLowerCase() === invite?.email.toLowerCase() ? (
                // Email matches
                <Button
                  onClick={handleAccept}
                  disabled={isAccepting}
                  className="w-full"
                  size="lg"
                >
                  {isAccepting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Accept Invitation
                    </>
                  )}
                </Button>
              ) : (
                // Email doesn't match
                <div className="space-y-3">
                  <div className="bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200 text-sm p-3 rounded-md">
                    This invite was sent to <strong>{invite?.email}</strong>, but you're logged in as <strong>{user?.email}</strong>.
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/auth/logout')}
                    className="w-full"
                  >
                    Sign out and use correct account
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // User is not logged in
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Sign in or create an account to accept this invitation.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleLogin}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
                <Button onClick={handleSignUp}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Button>
              </div>
            </div>
          )}

          <div className="text-center text-xs text-muted-foreground">
            This invitation expires on{' '}
            {invite?.expiresAt && new Date(invite.expiresAt).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteAcceptPage;
