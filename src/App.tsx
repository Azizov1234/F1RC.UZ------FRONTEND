import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Layouts
import AdminLayout from '@/components/layout/AdminLayout';
import RacerLayout from '@/components/layout/RacerLayout';
import OperatorLayout from '@/components/layout/OperatorLayout';
import TeamManagerLayout from '@/components/layout/TeamManagerLayout';

// Auth Page (Lazy Loaded)
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const MyNotificationsPage = lazy(() => import('@/pages/MyNotificationsPage'));

// ── ADMIN pages (Lazy Loaded) ──
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const UsersPage = lazy(() => import('@/pages/admin/UsersPage'));
const EventsPage = lazy(() => import('@/pages/admin/EventsPage'));
const BookingsPage = lazy(() => import('@/pages/admin/BookingsPage'));
const RaceSessionsPage = lazy(() => import('@/pages/admin/RaceSessionsPage'));
const LeaderboardPage = lazy(() => import('@/pages/admin/LeaderboardPage'));
const TeamsPage = lazy(() => import('@/pages/admin/TeamsPage'));
const SeasonsPage = lazy(() => import('@/pages/admin/SeasonsPage'));
const StreamsPage = lazy(() => import('@/pages/admin/StreamsPage'));
const PaymentsPage = lazy(() => import('@/pages/admin/PaymentsPage'));
const AuditLogsPage = lazy(() => import('@/pages/admin/AuditLogsPage'));
const VehiclesPage = lazy(() => import('@/pages/admin/VehiclesPage'));
const CategoriesPage = lazy(() => import('@/pages/admin/CategoriesPage'));
const SettingsPage = lazy(() => import('@/pages/admin/SettingsPage'));
const MaintenancePage = lazy(() => import('@/pages/admin/MaintenancePage'));
const ArenasPage = lazy(() => import('@/pages/admin/ArenasPage'));
const ArenaDetailPage = lazy(() => import('@/pages/admin/ArenaDetailPage'));
const AchievementsPage = lazy(() => import('@/pages/admin/AchievementsPage'));
const EventDetailPage = lazy(() => import('@/pages/admin/EventDetailPage'));
const RaceSessionDetailPage = lazy(() => import('@/pages/admin/RaceSessionDetailPage'));
const ReferralsPage = lazy(() => import('@/pages/admin/ReferralsPage'));
const NotificationsPage = lazy(() => import('@/pages/admin/NotificationsPage'));

// ── RACER pages (Lazy Loaded) ──
const RacerDashboard = lazy(() => import('@/pages/racer/RacerDashboard'));
const RacerExplorePage = lazy(() => import('@/pages/racer/RacerExplorePage'));
const RacerEventsPage = lazy(() => import('@/pages/racer/RacerEventsPage'));
const RacerLeaderboardPage = lazy(() => import('@/pages/racer/RacerLeaderboardPage'));
const RacerChallengesPage = lazy(() => import('@/pages/racer/RacerChallengesPage'));
const RacerProfilePage = lazy(() => import('@/pages/racer/RacerProfilePage'));
const RacerPaymentsPage = lazy(() => import('@/pages/racer/RacerPaymentsPage'));

// ── OPERATOR pages (Lazy Loaded) ──
const OperatorDashboard = lazy(() => import('@/pages/operator/OperatorDashboard'));
const OperatorCheckInPage = lazy(() => import('@/pages/operator/OperatorCheckInPage'));

// ── TEAM MANAGER pages (Lazy Loaded) ──
const TeamManagerDashboard = lazy(() => import('@/pages/team-manager/TeamManagerDashboard'));

// ── VIEWER pages (Lazy Loaded) ──
const PermissionDenied = lazy(() => import('@/pages/PermissionDenied'));

import { type F1User } from '@/api/base44Client';

// Loading indicator for route transitions
function PageTransitionLoader() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center bg-transparent">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-border border-t-primary rounded-full animate-spin" />
        <p className="text-[10px] text-muted-foreground font-display tracking-widest uppercase">Yuklanmoqda...</p>
      </div>
    </div>
  );
}

// Role-based redirect after login
function RoleRedirect({ user }: { user: F1User | null }) {
  const role = user?.role?.toLowerCase();
  if (role === 'admin' || role === 'superadmin') return <Navigate to="/admin" replace />;
  if (role === 'operator') return <Navigate to="/operator" replace />;
  if (role === 'team_manager') return <Navigate to="/team-manager" replace />;
  return <Navigate to="/racer" replace />;
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, user } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-border border-t-primary rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground font-display tracking-widest">F1RC.UZ YUKLANMOQDA...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageTransitionLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/403" element={<PermissionDenied />} />

          <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
            {/* Root → role-based redirect */}
            <Route path="/" element={<RoleRedirect user={user} />} />

            {/* ── SUPERADMIN / ADMIN ── */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/admin/users" element={<UsersPage />} />
                <Route path="/admin/events" element={<EventsPage />} />
                <Route path="/admin/events/:id" element={<EventDetailPage />} />
                <Route path="/admin/bookings" element={<BookingsPage />} />
                <Route path="/admin/race-sessions" element={<RaceSessionsPage />} />
                <Route path="/admin/race-sessions/:id" element={<RaceSessionDetailPage />} />
                <Route path="/admin/leaderboard" element={<LeaderboardPage />} />
                <Route path="/admin/teams" element={<TeamsPage />} />
                <Route path="/admin/seasons" element={<SeasonsPage />} />
                <Route path="/admin/streams" element={<StreamsPage />} />
                <Route path="/admin/payments" element={<PaymentsPage />} />
                <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
                <Route path="/admin/vehicles"   element={<VehiclesPage />} />
                <Route path="/admin/maintenance" element={<MaintenancePage />} />
                <Route path="/admin/arenas" element={<ArenasPage />} />
                <Route path="/admin/arenas/:id" element={<ArenaDetailPage />} />
                <Route path="/admin/achievements" element={<AchievementsPage />} />
                <Route path="/admin/categories" element={<CategoriesPage />} />
                <Route path="/admin/settings"   element={<SettingsPage />} />
                <Route path="/admin/referrals" element={<ReferralsPage />} />
                <Route path="/admin/notifications" element={<NotificationsPage />} />
                <Route path="/admin/profiles/:userId" element={<RacerProfilePage />} />
              </Route>
            </Route>

            {/* ── RACER ── */}
            <Route element={<ProtectedRoute allowedRoles={['RACER']} />}>
              <Route element={<RacerLayout />}>
                <Route path="/racer" element={<RacerDashboard />} />
                <Route path="/racer/explore" element={<RacerExplorePage />} />
                <Route path="/racer/events" element={<RacerEventsPage />} />
                <Route path="/racer/leaderboard" element={<RacerLeaderboardPage />} />
                <Route path="/racer/challenges" element={<RacerChallengesPage />} />
                <Route path="/racer/profile" element={<RacerProfilePage />} />
                <Route path="/racer/payments" element={<RacerPaymentsPage />} />
                <Route path="/racer/notifications" element={<MyNotificationsPage />} />
              </Route>
            </Route>

            {/* ── OPERATOR ── */}
            <Route element={<ProtectedRoute allowedRoles={['OPERATOR']} />}>
              <Route element={<OperatorLayout />}>
                <Route path="/operator" element={<OperatorDashboard />} />
                <Route path="/operator/bookings" element={<BookingsPage />} />
                <Route path="/operator/sessions" element={<RaceSessionsPage />} />
                <Route path="/operator/checkin" element={<OperatorCheckInPage />} />
                <Route path="/operator/notifications" element={<MyNotificationsPage />} />
              </Route>
            </Route>

            {/* ── TEAM MANAGER ── */}
            <Route element={<ProtectedRoute allowedRoles={['TEAM_MANAGER']} />}>
              <Route element={<TeamManagerLayout />}>
                <Route path="/team-manager" element={<TeamManagerDashboard />} />
                <Route path="/team-manager/team" element={<TeamsPage />} />
                <Route path="/team-manager/events" element={<EventsPage />} />
                <Route path="/team-manager/standings" element={<LeaderboardPage />} />
                <Route path="/team-manager/stats" element={<LeaderboardPage />} />
                <Route path="/team-manager/notifications" element={<MyNotificationsPage />} />
              </Route>
            </Route>

            {/* ── VIEWER ── */}
          </Route>

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
