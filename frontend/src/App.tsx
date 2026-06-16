import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';

// Layouts
import AdminLayout from '@/components/layout/AdminLayout';
import RacerLayout from '@/components/layout/RacerLayout';
import OperatorLayout from '@/components/layout/OperatorLayout';
import TeamManagerLayout from '@/components/layout/TeamManagerLayout';
import ViewerLayout from '@/components/layout/ViewerLayout';

// Auth
import Login from '@/pages/Login';

// ── ADMIN pages ──
import Dashboard from '@/pages/admin/Dashboard';
import UsersPage from '@/pages/admin/UsersPage';
import EventsPage from '@/pages/admin/EventsPage';
import BookingsPage from '@/pages/admin/BookingsPage';
import RaceSessionsPage from '@/pages/admin/RaceSessionsPage';
import LeaderboardPage from '@/pages/admin/LeaderboardPage';
import TeamsPage from '@/pages/admin/TeamsPage';
import SeasonsPage from '@/pages/admin/SeasonsPage';
import StreamsPage from '@/pages/admin/StreamsPage';
import PaymentsPage from '@/pages/admin/PaymentsPage';
import AuditLogsPage from '@/pages/admin/AuditLogsPage';
import VehiclesPage from '@/pages/admin/VehiclesPage';
import CategoriesPage from '@/pages/admin/CategoriesPage';
import SettingsPage from '@/pages/admin/SettingsPage';

// ── RACER pages ──
import RacerDashboard from '@/pages/racer/RacerDashboard';
import RacerEventsPage from '@/pages/racer/RacerEventsPage';
import RacerLeaderboardPage from '@/pages/racer/RacerLeaderboardPage';
import RacerChallengesPage from '@/pages/racer/RacerChallengesPage';
import RacerProfilePage from '@/pages/racer/RacerProfilePage';

// ── OPERATOR pages ──
import OperatorDashboard from '@/pages/operator/OperatorDashboard';
import OperatorCheckInPage from '@/pages/operator/OperatorCheckInPage';

// ── TEAM MANAGER pages ──
import TeamManagerDashboard from '@/pages/team-manager/TeamManagerDashboard';

// ── VIEWER pages ──
import ViewerDashboard from '@/pages/viewer/ViewerDashboard';

import { base44, type F1User } from '@/api/base44Client';

// Role-based redirect after login
function RoleRedirect({ user }: { user: F1User | null }) {
  const role = user?.role?.toLowerCase();
  if (role === 'admin' || role === 'superadmin') return <Navigate to="/admin" replace />;
  if (role === 'operator') return <Navigate to="/operator" replace />;
  if (role === 'team_manager') return <Navigate to="/team-manager" replace />;
  if (role === 'viewer') return <Navigate to="/viewer" replace />;
  return <Navigate to="/racer" replace />;
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, user } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
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
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        {/* Root → role-based redirect */}
        <Route path="/" element={<RoleRedirect user={user} />} />

        {/* ── SUPERADMIN / ADMIN ── */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/events" element={<EventsPage />} />
          <Route path="/admin/bookings" element={<BookingsPage />} />
          <Route path="/admin/race-sessions" element={<RaceSessionsPage />} />
          <Route path="/admin/leaderboard" element={<LeaderboardPage />} />
          <Route path="/admin/teams" element={<TeamsPage />} />
          <Route path="/admin/seasons" element={<SeasonsPage />} />
          <Route path="/admin/streams" element={<StreamsPage />} />
          <Route path="/admin/payments" element={<PaymentsPage />} />
          <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
          <Route path="/admin/vehicles"   element={<VehiclesPage />} />
          <Route path="/admin/categories" element={<CategoriesPage />} />
          <Route path="/admin/settings"   element={<SettingsPage />} />
        </Route>

        {/* ── RACER ── */}
        <Route element={<RacerLayout />}>
          <Route path="/racer" element={<RacerDashboard />} />
          <Route path="/racer/events" element={<RacerEventsPage />} />
          <Route path="/racer/leaderboard" element={<RacerLeaderboardPage />} />
          <Route path="/racer/challenges" element={<RacerChallengesPage />} />
          <Route path="/racer/profile" element={<RacerProfilePage />} />
        </Route>

        {/* ── OPERATOR ── */}
        <Route element={<OperatorLayout />}>
          <Route path="/operator" element={<OperatorDashboard />} />
          <Route path="/operator/bookings" element={<BookingsPage />} />
          <Route path="/operator/sessions" element={<RaceSessionsPage />} />
          <Route path="/operator/checkin" element={<OperatorCheckInPage />} />
          <Route path="/operator/racers" element={<UsersPage />} />
        </Route>

        {/* ── TEAM MANAGER ── */}
        <Route element={<TeamManagerLayout />}>
          <Route path="/team-manager" element={<TeamManagerDashboard />} />
          <Route path="/team-manager/team" element={<TeamsPage />} />
          <Route path="/team-manager/events" element={<EventsPage />} />
          <Route path="/team-manager/standings" element={<LeaderboardPage />} />
          <Route path="/team-manager/stats" element={<LeaderboardPage />} />
        </Route>

        {/* ── VIEWER ── */}
        <Route element={<ViewerLayout />}>
          <Route path="/viewer" element={<ViewerDashboard />} />
          <Route path="/viewer/events" element={<EventsPage />} />
          <Route path="/viewer/leaderboard" element={<LeaderboardPage />} />
          <Route path="/viewer/streams" element={<StreamsPage />} />
          <Route path="/viewer/profile" element={<RacerProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
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