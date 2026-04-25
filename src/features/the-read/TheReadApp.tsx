import React, { useEffect, useState } from 'react';
import './the-read.css';

import { Sidebar, TopBar, MobileHeader, MobileTabBar } from './components/Layout';
import { LoginDesktop, LoginMobile, RegisterDesktop } from './screens/Auth';
import { DashboardDesktop, DashboardMobile } from './screens/Dashboard';
import { FeedDesktop, FeedMobile } from './screens/Feed';
import { PostDesktop, PostMobile } from './screens/Post';
import { WriteDesktop, WriteMobile } from './screens/Write';
import { ProfileDesktop, ProfileMobile } from './screens/Profile';
import { NotificationsDesktop, NotificationsMobile } from './screens/Notifications';
import { AUTHORS } from './data';
import type { Post, RouteKey, RoleKey } from './types';

const ROLES: Record<RoleKey, typeof AUTHORS[string]> = {
  student: AUTHORS.u1,
  faculty: AUTHORS.u2,
  admin: { ...AUTHORS.u2, name: 'Dean Ramirez', initials: 'DR', role: 'ADMIN', dept: 'Office of the Dean', year: 'Admin' },
};

// ── Main app ──────────────────────────────────────────────────────────────────
export const TheReadApp: React.FC = () => {
  const [route, setRoute] = useState<RouteKey>('dashboard');
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [authed, setAuthed] = useState(true);
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<RoleKey>('student');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const user = ROLES[role];

  const go = (r: RouteKey, post?: Post) => {
    setRoute(r);
    if (post) setCurrentPost(post);
  };

  // ── Desktop ────────────────────────────────────────────────────────────────
  const renderDesktopContent = () => {
    if (!authed) {
      return authScreen === 'login'
        ? <LoginDesktop onLogin={() => setAuthed(true)} onRegister={() => setAuthScreen('register')} />
        : <RegisterDesktop onLogin={() => setAuthed(true)} onBack={() => setAuthScreen('login')} />;
    }
    return (
      <div className="tr-layout">
        <Sidebar route={route} go={go} user={user} roleKey={role} onRoleChange={r => setRole(r as RoleKey)} />
        <div className="tr-main">
          <TopBar route={route} />
          <div className="frame-scroll" style={{ flex: 1, minHeight: 0 }}>
            {route === 'dashboard' && <DashboardDesktop user={user} nav={go} />}
            {route === 'feed' && <FeedDesktop nav={go} />}
            {route === 'write' && <WriteDesktop user={user} nav={go} />}
            {route === 'post' && currentPost && <PostDesktop post={currentPost} user={user} nav={go} />}
            {route === 'notifications' && <NotificationsDesktop />}
            {route === 'profile' && <ProfileDesktop user={user} nav={go} />}
          </div>
        </div>
      </div>
    );
  };

  // ── Mobile ─────────────────────────────────────────────────────────────────
  const renderMobileContent = () => {
    if (!authed) {
      return <LoginMobile onLogin={() => setAuthed(true)} onRegister={() => setAuthScreen('register')} />;
    }
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--paper)', position: 'relative' }}>
        <MobileHeader user={user} />
        <div className="frame-scroll" style={{ flex: 1, minHeight: 0 }}>
          {route === 'dashboard' && <DashboardMobile user={user} nav={go} />}
          {route === 'feed' && <FeedMobile nav={go} />}
          {route === 'write' && <WriteMobile user={user} nav={go} />}
          {route === 'post' && currentPost && <PostMobile post={currentPost} nav={go} />}
          {route === 'notifications' && <NotificationsMobile />}
          {route === 'profile' && <ProfileMobile user={user} nav={go} />}
        </div>
        <MobileTabBar route={route} go={go} />
      </div>
    );
  };

  return (
    <div className="tr-root paper-bg" style={{ minHeight: '100vh', position: 'relative' }}>
      {isMobile ? renderMobileContent() : renderDesktopContent()}

      {/* Auth toggle (demo helper) */}
      <button
        onClick={() => setAuthed(a => !a)}
        style={{
          position: 'fixed', top: 14, right: 14, zIndex: 100,
          background: authed ? 'var(--paper)' : 'var(--burgundy)',
          color: authed ? 'var(--ink-2)' : '#fbf8f2',
          border: 'none', padding: '8px 14px', borderRadius: 999,
          fontSize: 11.5, cursor: 'pointer',
          fontFamily: 'Inter,sans-serif', fontWeight: 600,
          boxShadow: '2px 2px 8px rgba(0,0,0,.2)',
        }}
      >
        {authed ? 'Show login' : 'Back to app'}
      </button>
    </div>
  );
};
