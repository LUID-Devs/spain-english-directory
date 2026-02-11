import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useGlobalStore } from '@/stores/globalStore';
import AuthProvider from '@/app/authProvider';
import DashboardWrapper from '@/app/dashboardWrapper';
import { SubscriptionProvider } from '@/components/SubscriptionProvider';

// Auth Components (eager imports for immediate auth flow)
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import OAuthCallbackPage from '@/pages/auth/OAuthCallbackPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';

// Dashboard Components (lazy loaded)
const DashboardPage = React.lazy(() => import('@/pages/dashboard/DashboardPage'));
const ProjectsPage = React.lazy(() => import('@/pages/dashboard/projects/ProjectsPage'));
const ProjectDetailPage = React.lazy(() => import('@/pages/dashboard/projects/ProjectDetailPage'));
const TasksPage = React.lazy(() => import('@/app/dashboard/tasks/page'));
const TaskDetailPage = React.lazy(() => import('@/pages/dashboard/tasks/TaskDetailPage'));
const TeamsPage = React.lazy(() => import('@/pages/dashboard/teams/TeamsPage'));
const UsersPage = React.lazy(() => import('@/pages/dashboard/users/UsersPage'));
const SettingsPage = React.lazy(() => import('@/app/dashboard/settings/page'));
const TimelinePage = React.lazy(() => import('@/pages/dashboard/timeline/TimelinePage'));
const MissionControlPage = React.lazy(() => import('@/pages/dashboard/mission-control/MissionControlPage'));

// Priority Pages (lazy loaded)
const HighPriorityPage = React.lazy(() => import('@/pages/dashboard/priority/HighPriorityPage'));
const UrgentPriorityPage = React.lazy(() => import('@/pages/dashboard/priority/UrgentPriorityPage'));
const MediumPriorityPage = React.lazy(() => import('@/pages/dashboard/priority/MediumPriorityPage'));
const LowPriorityPage = React.lazy(() => import('@/pages/dashboard/priority/LowPriorityPage'));
const BacklogPriorityPage = React.lazy(() => import('@/pages/dashboard/priority/BacklogPriorityPage'));

// Other Pages (lazy loaded)
const LandingPage = React.lazy(() => import('@/pages/landing/LandingPage'));
const PricingPage = React.lazy(() => import('@/pages/pricing/PricingPage'));
const InviteAcceptPage = React.lazy(() => import('@/pages/organizations/invite/InviteAcceptPage'));

// Legal Pages (lazy loaded)
const PrivacyPolicy = React.lazy(() => import('@/pages/legal/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('@/pages/legal/TermsOfService'));
const CookiePolicy = React.lazy(() => import('@/pages/legal/CookiePolicy'));

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
      <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />

          {/* Legal Routes */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/cookies" element={<CookiePolicy />} />

          {/* Auth Routes */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

          {/* Organization Routes */}
          <Route path="/organizations/invite/:token" element={<InviteAcceptPage />} />

          {/* Dashboard Routes (Protected) */}
          <Route path="/dashboard/*" element={
            <SubscriptionProvider>
              <DashboardWrapper>
                <Routes>
                <Route index element={<DashboardPage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="projects/:id" element={<ProjectDetailPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="tasks/:id" element={<TaskDetailPage />} />
                <Route path="teams" element={<TeamsPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="timeline" element={<TimelinePage />} />
                <Route path="mission-control" element={<MissionControlPage />} />

                {/* Priority Routes */}
                <Route path="priority/high" element={<HighPriorityPage />} />
                <Route path="priority/urgent" element={<UrgentPriorityPage />} />
                <Route path="priority/medium" element={<MediumPriorityPage />} />
                <Route path="priority/low" element={<LowPriorityPage />} />
                <Route path="priority/backlog" element={<BacklogPriorityPage />} />
                </Routes>
              </DashboardWrapper>
            </SubscriptionProvider>
          } />

          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: isDarkMode ? '#374151' : '#ffffff',
            color: isDarkMode ? '#f9fafb' : '#111827',
            border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
          },
        }}
        theme={isDarkMode ? 'dark' : 'light'}
        richColors
        closeButton
      />
    </AuthProvider>
  );
}

export default App;
