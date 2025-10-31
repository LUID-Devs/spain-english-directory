import { useAuth } from "react-oidc-context";

export const useAuthenticatedApi = () => {
  const auth = useAuth();

  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    const token = auth.user?.access_token;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  const getCurrentUser = async () => {
    if (!auth.user?.profile?.sub) return null;
    
    try {
      return await makeAuthenticatedRequest(`/users/${auth.user.profile.sub}`);
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  };

  return {
    makeAuthenticatedRequest,
    getCurrentUser,
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
  };
};