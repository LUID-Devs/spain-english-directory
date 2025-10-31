import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface User {
  userId: number;
  cognitoId: string;
  username: string;
  email: string;
  profilePictureUrl?: string;
  teamId?: number;
  role: string;
  subscription?: {
    id: string;
    status: string;
    planId: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
  };
}

interface UserState {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  userIdentifier: string;
  
  // Actions
  setCurrentUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUserIdentifier: (identifier: string) => void;
  clearUser: () => void;
  updateUserProfile: (updates: Partial<User>) => void;
}

export const useUserStore = create<UserState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentUser: null,
    isLoading: false,
    error: null,
    userIdentifier: '',
    
    // Actions
    setCurrentUser: (user) => 
      set({ currentUser: user, error: null }),
    
    setLoading: (loading) => 
      set({ isLoading: loading }),
    
    setError: (error) => 
      set({ error, isLoading: false }),
    
    setUserIdentifier: (identifier) => 
      set({ userIdentifier: identifier }),
    
    clearUser: () => 
      set({ 
        currentUser: null, 
        isLoading: false, 
        error: null, 
        userIdentifier: '' 
      }),
    
    updateUserProfile: (updates) => {
      const currentUser = get().currentUser;
      if (currentUser) {
        set({ 
          currentUser: { ...currentUser, ...updates } 
        });
      }
    },
  }))
);

// Helper hook for getting current user
export const useCurrentUser = () => {
  const { currentUser, isLoading, error, userIdentifier } = useUserStore();
  return { currentUser, isLoading, error, userIdentifier };
};