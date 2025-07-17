import { useAuth } from "react-oidc-context";

export const useAuthToken = () => {
  const auth = useAuth();
  
  return {
    token: auth.user?.access_token,
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    getAuthHeader: () => {
      const token = auth.user?.access_token;
      return token ? `Bearer ${token}` : "";
    }
  };
};