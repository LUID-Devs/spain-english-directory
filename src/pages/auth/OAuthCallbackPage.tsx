import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { useAuth } from '@/app/authProvider';

const OAuthCallbackPage: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();

  useEffect(() => {
    let isProcessing = false;

    // Listen for auth events
    const hubListenerCancelToken = Hub.listen('auth', async ({ payload }) => {
      switch (payload.event) {
        case 'signInWithRedirect':
          if (!isProcessing) {
            isProcessing = true;
            await handleOAuthCallback();
          }
          break;
        case 'signInWithRedirect_failure':
          console.error('[OAUTH CALLBACK] Sign in with redirect failed:', payload.data);
          setStatus('error');
          setError(`OAuth sign-in failed: ${payload.data?.message || 'Unknown error'}`);
          setTimeout(() => navigate('/auth/login'), 3000);
          break;
      }
    });

    // Give Amplify time to process the URL params, then check
    // Increased to 4000ms to ensure OAuth flow completes fully
    const timeoutId = setTimeout(() => {
      if (!isProcessing) {
        isProcessing = true;
        handleOAuthCallback();
      }
    }, 4000);

    return () => {
      hubListenerCancelToken();
      clearTimeout(timeoutId);
    };
  }, []);

  const handleOAuthCallback = async () => {
    try {
      // Retry logic to wait for tokens with exponential backoff
      let session = null;
      let attempts = 0;
      const maxAttempts = 20; // Increased from 15

      while (attempts < maxAttempts) {
        // Exponential backoff: 500ms, 800ms, 1100ms, etc.
        const delay = Math.min(500 + (attempts * 300), 2000);
        await new Promise(resolve => setTimeout(resolve, delay));

        try {
          // Only force refresh after first attempt
          session = await fetchAuthSession({ forceRefresh: attempts > 0 });

          if (session.tokens?.accessToken) {
            break;
          }
        } catch (err) {
          // Continue retrying
        }

        attempts++;
      }

      if (!session?.tokens?.accessToken) {
        console.error('[OAUTH CALLBACK] No tokens received after maximum attempts');
        throw new Error('No tokens received from OAuth after multiple attempts');
      }

      // Get user info
      const user = await getCurrentUser();

      // Notify backend of the login (to create user in database if needed)
      // and verify backend auth context is established before redirecting.
      let backendAuthReady = false;
      for (let i = 0; i < 5; i++) {
        try {
          const backendAuthResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/status`, {
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${session.tokens.accessToken}`,
              'X-ID-Token': `${session.tokens.idToken}`
            }
          });

          if (backendAuthResponse.ok) {
            const backendAuthData = await backendAuthResponse.json();
            if (backendAuthData?.isAuthenticated && backendAuthData?.user?.userId) {
              backendAuthReady = true;
              break;
            }
          }
        } catch (backendError) {
          // Retry backend auth verification
        }

        await new Promise(resolve => setTimeout(resolve, 600 * (i + 1)));
      }

      // Refresh auth state in the app
      await refreshAuth();

      if (!backendAuthReady) {
        throw new Error('Sign-in succeeded with Cognito, but backend session is not ready yet. Please try again.');
      }

      setStatus('success');

      // Redirect to dashboard after a brief delay to show success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500); // Increased from 1000ms
    } catch (err) {
      console.error('OAuth callback error:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Authentication failed');

      // Redirect to login after showing error
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-500 mx-auto"></div>
            <h2 className="mt-8 text-2xl font-bold text-white">
              Completing sign-in...
            </h2>
            <p className="mt-3 text-sm text-gray-400">
              Please wait while we finish setting up your account
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-500/20 border-2 border-gray-500">
              <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-8 text-2xl font-bold text-white">
              Sign-in successful!
            </h2>
            <p className="mt-3 text-sm text-gray-400">
              Redirecting to dashboard...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20 border-2 border-red-500">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-8 text-2xl font-bold text-white">
              Authentication failed
            </h2>
            <p className="mt-3 text-sm text-red-400">
              {error || 'Something went wrong'}
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Redirecting to login...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
