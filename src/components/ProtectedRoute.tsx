import { type ReactElement } from 'react';
import { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const DefaultFallback = (): ReactElement => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-border border-t-primary rounded-full animate-spin" />
      <p className="text-[10px] text-muted-foreground font-mono tracking-widest">
        YUKLANMOQDA...
      </p>
    </div>
  </div>
);

interface ProtectedRouteProps {
  fallback?: ReactElement;
  unauthenticatedElement?: ReactElement;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  fallback = <DefaultFallback />,
  unauthenticatedElement,
  allowedRoles,
}: ProtectedRouteProps): ReactElement | null {
  const { isLoadingAuth, authChecked, authError, checkUserAuth, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!authChecked && !isLoadingAuth) {
      void checkUserAuth();
    }
  }, [authChecked, isLoadingAuth, checkUserAuth]);

  if (isLoadingAuth || !authChecked) {
    return fallback;
  }

  if (authError && authError.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  if (!user) {
    const redirectPath = encodeURIComponent(location.pathname + location.search);
    return unauthenticatedElement ?? <Navigate to={`/login?redirect=${redirectPath}`} replace />;
  }

  // Role validation
  if (allowedRoles) {
    const userRole = String(user.role).toUpperCase();
    const isAllowed = allowedRoles.some(r => r.toUpperCase() === userRole);
    if (!isAllowed) {
      return <Navigate to="/403" replace />;
    }
  }

  return <Outlet />;
}
