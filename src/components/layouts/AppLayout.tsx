import { Link, NavLink, Outlet } from 'react-router-dom';
import { BookOpen, LogOut, PenLine, Shield, UserCog } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/store/authStore';

export function AppLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <BookOpen className="h-5 w-5" />
            The Read
          </Link>
          <nav className="hidden items-center gap-1 text-sm md:flex">
            <NavLink to="/blogs" className={({ isActive }) => navClass(isActive)}>Blogs</NavLink>
            {user && <NavLink to="/dashboard" className={({ isActive }) => navClass(isActive)}>Dashboard</NavLink>}
            {user && <NavLink to="/write" className={({ isActive }) => navClass(isActive)}><PenLine className="h-4 w-4" /> Write</NavLink>}
            {(user?.role === 'EDITOR' || user?.role === 'ADMIN') && <NavLink to="/editor" className={({ isActive }) => navClass(isActive)}><UserCog className="h-4 w-4" /> Editor</NavLink>}
            {user?.role === 'ADMIN' && <NavLink to="/admin" className={({ isActive }) => navClass(isActive)}><Shield className="h-4 w-4" /> Admin</NavLink>}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden text-sm text-slate-600 sm:inline">{user.name}</span>
                <Button variant="outline" size="sm" onClick={logout}><LogOut className="h-4 w-4" /> Logout</Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm"><Link to="/login">Login</Link></Button>
                <Button asChild size="sm"><Link to="/register">Register</Link></Button>
              </>
            )}
          </div>
        </div>
      </header>
      <Outlet />
      <Toaster position="top-right" />
    </div>
  );
}

function navClass(active: boolean) {
  return `inline-flex items-center gap-1 rounded-md px-3 py-2 ${active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`;
}
