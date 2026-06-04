import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/store/authStore';
import type { UserRole } from '@/types/auth';

export function RoleRoute({ roles }: { roles: UserRole[] }) {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) return <div className="grid min-h-[60vh] place-items-center text-slate-500">Loading session...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user || !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
