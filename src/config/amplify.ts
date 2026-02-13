import { Amplify } from 'aws-amplify';

/**
 * Configure AWS Amplify for Google OAuth through Cognito
 */
export const configureAmplify = () => {
  // Get environment variables with fallbacks for production
  const redirectUri = import.meta.env.VITE_COGNITO_REDIRECT_URI || 'https://taskluid.com/auth/callback';
  const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID || 'us-east-1_SpqXBs7w9';
  const userPoolClientId = import.meta.env.VITE_COGNITO_CLIENT_ID || '73b10s89a1ffbkadivolm6p3db';
  const domain = (import.meta.env.VITE_COGNITO_DOMAIN || 'https://us-east-1spqxbs7w9.auth.us-east-1.amazoncognito.com').replace('https://', '');
  
  // Validate required configuration
  if (!redirectUri || redirectUri === '') {
    console.error("[configureAmplify] VITE_COGNITO_REDIRECT_URI is not configured! Using default.");
  }
  
  if (!userPoolClientId || userPoolClientId === 'your_cognito_client_id') {
    console.error("[configureAmplify] VITE_COGNITO_CLIENT_ID is not properly configured!");
  }
  
  // Log configuration in development
  if (import.meta.env.DEV) {
    console.log('[configureAmplify] Configuring with:', {
      userPoolId,
      userPoolClientId: userPoolClientId ? '***' + userPoolClientId.slice(-4) : 'NOT SET',
      domain,
      redirectUri,
    });
  }
  
  try {
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId,
          userPoolClientId,
          loginWith: {
            oauth: {
              domain,
              scopes: ['openid', 'email', 'profile'],
              redirectSignIn: [redirectUri],
              redirectSignOut: [
                redirectUri.replace('/auth/callback', '/auth/login')
              ],
              responseType: 'code',
            },
          },
        },
      },
    });
    
    if (import.meta.env.DEV) {
      console.log('[configureAmplify] Successfully configured');
    }
  } catch (error) {
    console.error('[configureAmplify] Failed to configure Amplify:', error);
    throw error;
  }
};
