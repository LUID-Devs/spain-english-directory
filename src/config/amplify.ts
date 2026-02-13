import { Amplify } from 'aws-amplify';

/**
 * Configure AWS Amplify for Google OAuth through Cognito
 */
export const configureAmplify = () => {
  const redirectUri = import.meta.env.VITE_COGNITO_REDIRECT_URI;
  
  // Validate required environment variables
  if (!redirectUri) {
    console.error("[configureAmplify] VITE_COGNITO_REDIRECT_URI is not configured! OAuth redirects may fail.");
  }
  
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'us-east-1_SpqXBs7w9',
        userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '73b10s89a1ffbkadivolm6p3db',
        loginWith: {
          oauth: {
            // Remove https:// prefix from domain
            domain: (import.meta.env.VITE_COGNITO_DOMAIN || 'https://us-east-1spqxbs7w9.auth.us-east-1.amazoncognito.com').replace('https://', ''),
            scopes: ['openid', 'email', 'profile'],
            redirectSignIn: [redirectUri || ''],
            redirectSignOut: [
              (redirectUri || '').replace('/auth/callback', '/auth/login')
            ],
            responseType: 'code',
          },
        },
      },
    },
  });
};
