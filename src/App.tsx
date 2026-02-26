import React, { Suspense, useEffect, useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NotFoundPage from '@/pages/NotFoundPage';
import { Toaster } from 'sonner';
import { useGlobalStore } from '@/stores/globalStore';
import AuthProvider, { useAuth } from '@/app/authProvider';
import DashboardWrapper from '@/app/dashboardWrapper';
import { SubscriptionProvider } from '@/components/SubscriptionProvider';
import { useQuickAddTask } from '@/hooks/useQuickAddTask';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { UndoProvider } from '@/contexts/UndoContext';
import QuickAddTaskModal from '@/components/QuickAddTaskModal';
import CommandPalette from '@/components/CommandPalette';
import KeyboardShortcutsHelp from '@/components/KeyboardShortcutsHelp';
import RouteErrorBoundary from '@/components/RouteErrorBoundary';
import AuthErrorDisplay from '@/components/AuthErrorDisplay';

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
const CreateProjectPage = React.lazy(() => import('@/pages/dashboard/projects/CreateProjectPage'));
const TasksPage = React.lazy(() => import('@/app/dashboard/tasks/page'));
const TaskDetailPage = React.lazy(() => import('@/pages/dashboard/tasks/TaskDetailPage'));
const TriagePage = React.lazy(() => import('@/pages/dashboard/triage/TriagePage'));
const TeamsPage = React.lazy(() => import('@/pages/dashboard/teams/TeamsPage'));
const UsersPage = React.lazy(() => import('@/pages/dashboard/users/UsersPage'));
const SettingsPage = React.lazy(() => import('@/app/dashboard/settings/page'));
const TimelinePage = React.lazy(() => import('@/pages/dashboard/timeline/TimelinePage'));
const MissionControlPage = React.lazy(() => import('@/pages/dashboard/mission-control/MissionControlPage'));
const WorkloadDashboardPage = React.lazy(() => import('@/pages/dashboard/workload/WorkloadDashboardPage'));
const GoalsPage = React.lazy(() => import('@/pages/dashboard/goals/GoalsPage'));
const GoalDetailPage = React.lazy(() => import('@/pages/dashboard/goals/GoalDetailPage'));
const AnalyticsDashboardPage = React.lazy(() => import('@/pages/dashboard/analytics/AnalyticsDashboardPage'));

// Priority Pages (lazy loaded)
const HighPriorityPage = React.lazy(() => import('@/pages/dashboard/priority/HighPriorityPage'));
const UrgentPriorityPage = React.lazy(() => import('@/pages/dashboard/priority/UrgentPriorityPage'));
const MediumPriorityPage = React.lazy(() => import('@/pages/dashboard/priority/MediumPriorityPage'));
const LowPriorityPage = React.lazy(() => import('@/pages/dashboard/priority/LowPriorityPage'));
const BacklogPriorityPage = React.lazy(() => import('@/pages/dashboard/priority/BacklogPriorityPage'));
const ArchivedTasksPage = React.lazy(() => import('@/app/dashboard/archived-tasks/page'));
const AutomationPage = React.lazy(() => import('@/pages/dashboard/automation/AutomationPage'));

// Other Pages (lazy loaded)
const LandingPage = React.lazy(() => import('@/pages/landing/LandingPage'));
const LuidKitLandingPage = React.lazy(() => import('@/pages/landing/LuidKitLandingPage'));
const ResumeLuidLandingPage = React.lazy(() => import('@/pages/landing/ResumeLuidLandingPage'));
// Pricing page - must be prerendered for SEO (see vite-plugin-static-prerender.ts)
const PricingPage = React.lazy(() => import('@/pages/pricing/PricingPage'));
const FeaturesPage = React.lazy(() => import('@/pages/features/FeaturesPage'));
const InviteAcceptPage = React.lazy(() => import('@/pages/organizations/invite/InviteAcceptPage'));

// Legal Pages (lazy loaded)
const PrivacyPolicy = React.lazy(() => import('@/pages/legal/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('@/pages/legal/TermsOfService'));
const CookiePolicy = React.lazy(() => import('@/pages/legal/CookiePolicy'));

// Help & Docs Pages (lazy loaded)
const HelpPage = React.lazy(() => import('@/pages/help/HelpPage'));
const DocsPage = React.lazy(() => import('@/pages/docs/DocsPage'));

// Public Status Pages (lazy loaded)
const ProjectStatusPage = React.lazy(() => import('@/pages/status/ProjectStatusPage'));

const resolveLandingVariant = () => {
  const configuredVariant = import.meta.env.VITE_LANDING_VARIANT;
  if (configuredVariant) {
    return configuredVariant;
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (host.includes('luidkit') || host.includes('fileconvertpro')) {
      return 'luidkit';
    }
    if (host.includes('resumeluid')) {
      return 'resumeluid';
    }
  }

  return 'taskluid';
};

const RootLandingPage = () => {
  const landingVariant = React.useMemo(() => resolveLandingVariant(), []);
  if (landingVariant === 'luidkit') {
    return <LuidKitLandingPage />;
  }
  if (landingVariant === 'resumeluid') {
    return <ResumeLuidLandingPage />;
  }
  return <LandingPage />;
};

// Inner app component that can use auth context
function AppContent() {
  const { isDarkMode } = useGlobalStore();
  const { isOpen, open, close } = useQuickAddTask();
  const { isOpen: isCommandPaletteOpen, open: openCommandPalette, close: closeCommandPalette } = useCommandPalette();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Initialize keyboard shortcuts (search is handled by Navbar directly)
  useKeyboardShortcuts({
    onShowHelp: () => setIsHelpOpen(true),
    onCreateTask: open,
    onFocusSearch: () => {}, // Handled by Navbar
    onOpenCommandPalette: openCommandPalette,
    enabled: true,
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <UndoProvider>
      <AuthErrorDisplay />
      <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/luidkit" element={<LuidKitLandingPage />} />
          <Route path="/resumeluid" element={<ResumeLuidLandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/features" element={<FeaturesPage />} />

          {/* Legal Routes */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/cookies" element={<CookiePolicy />} />

          {/* Help & Docs Routes */}
          <Route path="/help" element={<HelpPage />} />
          <Route path="/docs" element={<DocsPage />} />

          {/* Public Project Status Routes */}
          <Route path="/status/:token" element={<ProjectStatusPage />} />

          {/* Auth Routes */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/sign-in" element={<Navigate to="/auth/login" replace />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/sign-up" element={<Navigate to="/auth/register" replace />} />
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

          {/* Legacy redirect routes for SEO/backward compatibility */}
          <Route path="/login" element={<Navigate to="/auth/login" replace />} />
          <Route path="/register" element={<Navigate to="/auth/register" replace />} />
          <Route path="/forgot-password" element={<Navigate to="/auth/forgot-password" replace />} />

          {/* Organization Routes */}
          <Route path="/organizations/invite/:token" element={<InviteAcceptPage />} />

          {/* Dashboard Routes (Protected) */}
          <Route path="/dashboard/*" element={
            <SubscriptionProvider>
              <DashboardWrapper>
                <Routes>
                <Route index element={
                  <RouteErrorBoundary componentName="Dashboard">
                    <DashboardPage />
                  </RouteErrorBoundary>
                } />
                <Route path="projects" element={
                  <RouteErrorBoundary componentName="Projects">
                    <ProjectsPage />
                  </RouteErrorBoundary>
                } />
                <Route path="projects/create" element={
                  <RouteErrorBoundary componentName="Create Project">
                    <CreateProjectPage />
                  </RouteErrorBoundary>
                } />
                <Route path="projects/:id" element={
                  <RouteErrorBoundary componentName="Project Detail">
                    <ProjectDetailPage />
                  </RouteErrorBoundary>
                } />
                <Route path="tasks" element={
                  <RouteErrorBoundary componentName="Tasks">
                    <TasksPage />
                  </RouteErrorBoundary>
                } />
                <Route path="triage" element={
                  <RouteErrorBoundary componentName="Triage">
                    <TriagePage />
                  </RouteErrorBoundary>
                } />
                <Route path="tasks/:id" element={
                  <RouteErrorBoundary componentName="Task Detail">
                    <TaskDetailPage />
                  </RouteErrorBoundary>
                } />
                <Route path="teams" element={
                  <RouteErrorBoundary componentName="Teams">
                    <TeamsPage />
                  </RouteErrorBoundary>
                } />
                <Route path="users" element={
                  <RouteErrorBoundary componentName="Users">
                    <UsersPage />
                  </RouteErrorBoundary>
                } />
                <Route path="settings" element={
                  <RouteErrorBoundary componentName="Settings">
                    <SettingsPage />
                  </RouteErrorBoundary>
                } />
                <Route path="timeline" element={
                  <RouteErrorBoundary componentName="Timeline">
                    <TimelinePage />
                  </RouteErrorBoundary>
                } />
                <Route path="mission-control" element={
                  <RouteErrorBoundary componentName="Mission Control">
                    <MissionControlPage />
                  </RouteErrorBoundary>
                } />
                <Route path="workload" element={
                  <RouteErrorBoundary componentName="Workload Dashboard">
                    <WorkloadDashboardPage />
                  </RouteErrorBoundary>
                } />
                <Route path="analytics" element={
                  <RouteErrorBoundary componentName="Analytics Dashboard">
                    <AnalyticsDashboardPage />
                  </RouteErrorBoundary>
                } />
                <Route path="goals" element={
                  <RouteErrorBoundary componentName="Goals">
                    <GoalsPage />
                  </RouteErrorBoundary>
                } />
                <Route path="goals/:goalId" element={
                  <RouteErrorBoundary componentName="Goal Detail">
                    <GoalDetailPage />
                  </RouteErrorBoundary>
                } />
                {/* Priority Routes */}
                <Route path="priority/high" element={
                  <RouteErrorBoundary componentName="High Priority">
                    <HighPriorityPage />
                  </RouteErrorBoundary>
                } />
                <Route path="priority/urgent" element={
                  <RouteErrorBoundary componentName="Urgent Priority">
                    <UrgentPriorityPage />
                  </RouteErrorBoundary>
                } />
                <Route path="priority/medium" element={
                  <RouteErrorBoundary componentName="Medium Priority">
                    <MediumPriorityPage />
                  </RouteErrorBoundary>
                } />
                <Route path="priority/low" element={
                  <RouteErrorBoundary componentName="Low Priority">
                    <LowPriorityPage />
                  </RouteErrorBoundary>
                } />
                <Route path="priority/backlog" element={
                  <RouteErrorBoundary componentName="Backlog">
                    <BacklogPriorityPage />
                  </RouteErrorBoundary>
                } />
                <Route path="archived-tasks" element={
                  <RouteErrorBoundary componentName="Archived Tasks">
                    <ArchivedTasksPage />
                  </RouteErrorBoundary>
                } />
                <Route path="automation" element={
                  <RouteErrorBoundary componentName="Automation">
                    <AutomationPage />
                  </RouteErrorBoundary>
                } />
                </Routes>
              </DashboardWrapper>
            </SubscriptionProvider>
          } />

          {/* Root route - show landing page */}
          <Route path="/" element={<RootLandingPage />} />
          
          {/* 404 Not Found - Show proper error page instead of redirecting */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
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

      {/* Global Quick Add Task Modal */}
      <QuickAddTaskModal isOpen={isOpen} onClose={close} />
      
      {/* Global Command Palette */}
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={closeCommandPalette} />
      
      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </UndoProvider>
  );
}

// Main App component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
