import { Link, NavLink, Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Bell, BookOpen, Home, LogOut, Shield, UploadCloud, UserCog } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/store/authStore';

export function AppLayout() {
  const { user, logout } = useAuth();
  const isStaff = user?.role === 'EDITOR' || user?.role === 'ADMIN';
  const canWrite = isStaff;

  return (
    <div className="min-h-screen bg-[#eef0e9] text-[#231b17]">
      <header className="sticky top-0 z-30 border-b border-white/40 bg-[#eef0e9]/95 shadow-[0_8px_22px_rgba(97,85,68,0.1),inset_0_-5px_12px_rgba(97,85,68,0.06)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-t-full rounded-b-lg bg-[#7b2d32] font-serif text-lg font-bold italic text-[#fffaf1] shadow-[7px_7px_16px_rgba(92,31,37,0.25),-3px_-3px_10px_rgba(255,255,250,0.62),inset_1px_1px_1px_rgba(255,255,255,0.18)]">R</span>
            <span className="leading-none">
              <span className="block font-serif text-xl font-semibold tracking-tight"><span className="font-normal italic">the</span> Read</span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a9793d] sm:block">Journal Portal</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 text-sm md:flex">
            <NavLink to="/blogs" className={({ isActive }) => navClass(isActive)}>Blogs</NavLink>
            {isStaff && <NavLink to="/editor" className={({ isActive }) => navClass(isActive)}><UserCog className="h-4 w-4" /> Editor</NavLink>}
            {user?.role === 'ADMIN' && <NavLink to="/admin" className={({ isActive }) => navClass(isActive)}><Shield className="h-4 w-4" /> Admin</NavLink>}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <>
                {canWrite && <Button asChild size="sm"><Link to="/write"><UploadCloud className="h-4 w-4" /> Submit blog</Link></Button>}
                <button className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-[#eef0e9] text-[#5c4b3d] shadow-[6px_6px_14px_rgba(97,85,68,0.15),-5px_-5px_12px_rgba(255,255,250,0.8)] sm:flex" type="button" aria-label="Notifications">
                  <Bell className="h-4 w-4" />
                </button>
                <Link to="/profile" className="hidden h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#53693a] font-serif font-semibold text-[#fffaf1] shadow-[7px_7px_15px_rgba(83,105,58,0.24),-4px_-4px_11px_rgba(255,255,250,0.72)] sm:flex" aria-label="Profile">
                  {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" /> : initials(user.name)}
                </Link>
                <Link to="/profile" className="hidden text-sm font-medium text-[#5c4b3d] hover:text-[#7b2d32] lg:inline">{user.name}</Link>
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
      <div className="min-h-[calc(100vh-65px)] bg-[#eef0e9]">
        <Outlet />
      </div>
      <nav className="fixed inset-x-3 bottom-3 z-40 flex rounded-2xl border border-white/60 bg-[#eef0e9]/95 p-2 shadow-[10px_10px_24px_rgba(97,85,68,0.2),-6px_-6px_16px_rgba(255,255,250,0.84)] backdrop-blur md:hidden">
        <MobileNavLink to="/" label="Home" icon={<Home className="h-4 w-4" />} />
        <MobileNavLink to="/blogs" label="Feed" icon={<BookOpen className="h-4 w-4" />} />
        {canWrite && <MobileNavLink to="/write" label="Submit" icon={<UploadCloud className="h-4 w-4" />} />}
        {isStaff && <MobileNavLink to="/editor/submissions" label="Editor" icon={<UserCog className="h-4 w-4" />} />}
        {user?.role === 'ADMIN' && <MobileNavLink to="/admin" label="Admin" icon={<Shield className="h-4 w-4" />} />}
      </nav>
      <Toaster position="top-right" />
    </div>
  );
}

function navClass(active: boolean) {
  return `inline-flex items-center gap-1 rounded-xl px-3 py-2 font-medium transition ${active ? 'bg-[#eef0e9] text-[#7b2d32] shadow-[inset_5px_5px_10px_rgba(97,85,68,0.15),inset_-5px_-5px_10px_rgba(255,255,250,0.84)]' : 'text-[#74685f] hover:bg-[#e5e9df] hover:text-[#231b17] hover:shadow-[5px_5px_12px_rgba(97,85,68,0.12),-4px_-4px_10px_rgba(255,255,250,0.75)]'}`;
}

function MobileNavLink({ to, label, icon }: { to: string; label: string; icon: ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-medium ${isActive ? 'bg-[#e5e9df] text-[#7b2d32] shadow-[inset_4px_4px_9px_rgba(97,85,68,0.14),inset_-4px_-4px_9px_rgba(255,255,250,0.8)]' : 'text-[#74685f]'}`}
    >
      {icon}
      {label}
    </NavLink>
  );
}

function initials(name?: string) {
  return (name ?? 'TR').split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}
