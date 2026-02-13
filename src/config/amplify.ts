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
  const region = import.meta.env.VITE_COGNITO_REGION || 'us-east-1';
  
  // Check if using default values (env vars not properly loaded)
  const isUsingDefaultRedirectUri = !import.meta.env.VITE_COGNITO_REDIRECT_URI;
  const isUsingDefaultUserPoolId = !import.meta.env.VITE_COGNITO_USER_POOL_ID;
  const isUsingDefaultClientId = !import.meta.env.VITE_COGNITO_CLIENT_ID;
  
  // Validate required configuration
  if (isUsingDefaultRedirectUri) {
    console.warn('[configureAmplify] VITE_COGNITO_REDIRECT_URI not configured in environment. Using fallback: ' + redirectUri);
  }
  
  if (isUsingDefaultUserPoolId) {
    console.warn('[configureAmplify] VITE_COGNITO_USER_POOL_ID not configured in environment. Using fallback.');
  }
  
  if (isUsingDefaultClientId) {
    console.warn('[configureAmplify] VITE_COGNITO_CLIENT_ID not configured in environment. Using fallback.');
  }
  
  // Log configuration issues in production (not just dev)
  if (isUsingDefaultRedirectUri || isUsingDefaultUserPoolId || isUsingDefaultClientId) {
    console.warn('[configureAmplify] Some environment variables are using fallback values. Check your .env.production file.');
  }
  
  // Debug logging (only in development)
  if (import.meta.env.DEV) {
    console.log('[configureAmplify] Configuring with:', {
      region,
      userPoolId,
      userPoolClientId: userPoolClientId ? '***' + userPoolClientId.slice(-4) : 'NOT SET',
      domain,
      redirectUri,
      usingDefaults: {
        redirectUri: isUsingDefaultRedirectUri,
        userPoolId: isUsingDefaultUserPoolId,
        clientId: isUsingDefaultClientId,
      },
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
