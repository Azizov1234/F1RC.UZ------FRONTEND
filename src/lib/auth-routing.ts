import { isSafeRedirectUrl } from '@/lib/security';

export function dashboardPathForRole(role?: string | null): string {
  switch (role?.toUpperCase()) {
    case 'SUPERADMIN':
    case 'ADMIN':
      return '/admin';
    case 'OPERATOR':
      return '/operator';
    case 'TEAM_MANAGER':
      return '/team-manager';
    case 'RACER':
      return '/racer';
    default:
      return '/';
  }
}

export function resolveAuthRedirect(
  redirect: string | null,
  role?: string | null,
): string {
  return redirect && isSafeRedirectUrl(redirect)
    ? redirect
    : dashboardPathForRole(role);
}
