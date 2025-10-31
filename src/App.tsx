import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useGlobalStore } from '@/stores/globalStore';
import AuthProvider from '@/app/authProvider';
import DashboardWrapper from '@/app/dashboardWrapper';

// Auth Components
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Dashboard Components
import DashboardPage from '@/pages/dashboard/DashboardPage';
import ProjectsPage from '@/pages/dashboard/projects/ProjectsPage';
import ProjectDetailPage from '@/pages/dashboard/projects/ProjectDetailPage';
import TaskDetailPage from '@/pages/dashboard/tasks/TaskDetailPage';
import TeamsPage from '@/pages/dashboard/teams/TeamsPage';
import UsersPage from '@/pages/dashboard/users/UsersPage';
import SettingsPage from '@/pages/dashboard/settings/SettingsPage';
import SearchPage from '@/pages/dashboard/search/SearchPage';
import TimelinePage from '@/pages/dashboard/timeline/TimelinePage';

// Priority Pages
import HighPriorityPage from '@/pages/dashboard/priority/HighPriorityPage';
import UrgentPriorityPage from '@/pages/dashboard/priority/UrgentPriorityPage';
import MediumPriorityPage from '@/pages/dashboard/priority/MediumPriorityPage';
import LowPriorityPage from '@/pages/dashboard/priority/LowPriorityPage';
import BacklogPriorityPage from '@/pages/dashboard/priority/BacklogPriorityPage';

// Other Pages
import LandingPage from '@/pages/landing/LandingPage';
import PricingPage from '@/pages/pricing/PricingPage';

function App() {
  const { isDarkMode } = useGlobalStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        
        {/* Auth Routes */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        
        {/* Dashboard Routes (Protected) */}
        <Route path="/dashboard/*" element={
          <DashboardWrapper>
            <Routes>
              <Route index element={<DashboardPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/:id" element={<ProjectDetailPage />} />
              <Route path="tasks/:id" element={<TaskDetailPage />} />
              <Route path="teams" element={<TeamsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="timeline" element={<TimelinePage />} />
              
              {/* Priority Routes */}
              <Route path="priority/high" element={<HighPriorityPage />} />
              <Route path="priority/urgent" element={<UrgentPriorityPage />} />
              <Route path="priority/medium" element={<MediumPriorityPage />} />
              <Route path="priority/low" element={<LowPriorityPage />} />
              <Route path="priority/backlog" element={<BacklogPriorityPage />} />
            </Routes>
          </DashboardWrapper>
        } />
        
        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;