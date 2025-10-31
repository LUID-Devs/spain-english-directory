import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GlobalState {
  isSidebarCollapsed: boolean;
  isDarkMode: boolean;
  
  // Actions
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  setIsDarkMode: (darkMode: boolean) => void;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      // Initial state
      isSidebarCollapsed: false,
      isDarkMode: false,
      
      // Actions
      setIsSidebarCollapsed: (collapsed) => 
        set({ isSidebarCollapsed: collapsed }),
      
      setIsDarkMode: (darkMode) => 
        set({ isDarkMode: darkMode }),
      
      toggleSidebar: () => 
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      
      toggleDarkMode: () => 
        set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: 'global-store',
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);