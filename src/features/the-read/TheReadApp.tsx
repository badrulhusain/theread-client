import React, { useEffect, useState } from 'react';
import './the-read.css';

import { Sidebar, TopBar, MobileHeader, MobileTabBar } from './components/Layout';
import { LoginDesktop, LoginMobile, RegisterDesktop } from './screens/Auth';
import { DashboardDesktop, DashboardMobile } from './screens/Dashboard';
import { FeedDesktop, FeedMobile } from './screens/Feed';
import { PostDesktop, PostMobile } from './screens/Post';
import { WriteDesktop, WriteMobile } from './screens/Write';
import { ProfileDesktop, ProfileMobile } from './screens/Profile';
import { AuthProvider, useAuth } from './AuthContext';
import type { Post, RouteKey } from './types';

// ── Inner app (needs auth context) ────────────────────────────────────────────
const AppInner: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [route, setRoute] = useState<RouteKey>('dashboard');
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const go = (r: RouteKey, post?: Post) => {
    setRoute(r);
    if (post) setCurrentPost(post);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--paper)' }}>
        <div className="tr-serif" style={{ fontSize: 20, color: 'var(--ink-2)' }}>Loading…</div>
      </div>
    );
  }

  const authed = !!user;

  // ── Desktop ──────────────────────────────────────────────────────────────────
  const renderDesktopContent = () => {
    if (!authed) {
      return authScreen === 'login'
        ? <LoginDesktop onRegister={() => setAuthScreen('register')} />
        : <RegisterDesktop onBack={() => setAuthScreen('login')} />;
    }
    return (
      <div className="tr-layout">
        <Sidebar route={route} go={go} user={user!} onLogout={logout} />
        <div className="tr-main">
          <TopBar route={route} />
          <div className="frame-scroll" style={{ flex: 1, minHeight: 0 }}>
            {route === 'dashboard' && <DashboardDesktop user={user!} nav={go} />}
            {route === 'feed' && <FeedDesktop nav={go} />}
            {route === 'write' && <WriteDesktop user={user!} nav={go} />}
            {route === 'post' && currentPost && <PostDesktop post={currentPost} user={user!} nav={go} />}
            {route === 'notifications' && (
              <div style={{ padding: '28px 32px' }}>
                <div className="tr-display" style={{ fontSize: 40, fontWeight: 600 }}>Notifications</div>
                <p style={{ color: 'var(--ink-2)', marginTop: 12 }}>No new notifications.</p>
              </div>
            )}
            {route === 'profile' && <ProfileDesktop user={user!} nav={go} />}
          </div>
        </div>
      </div>
    );
  };

  // ── Mobile ───────────────────────────────────────────────────────────────────
  const renderMobileContent = () => {
    if (!authed) {
      return <LoginMobile onRegister={() => setAuthScreen('register')} />;
    }
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--paper)', position: 'relative' }}>
        <MobileHeader user={user!} />
        <div className="frame-scroll" style={{ flex: 1, minHeight: 0 }}>
          {route === 'dashboard' && <DashboardMobile user={user!} nav={go} />}
          {route === 'feed' && <FeedMobile nav={go} />}
          {route === 'write' && <WriteMobile user={user!} nav={go} />}
          {route === 'post' && currentPost && <PostMobile post={currentPost} nav={go} />}
          {route === 'notifications' && (
            <div style={{ padding: '14px 16px 90px' }}>
              <h1 className="tr-display" style={{ margin: '0 0 14px', fontSize: 28, fontWeight: 600 }}>Notifications</h1>
              <p style={{ color: 'var(--ink-2)' }}>No new notifications.</p>
            </div>
          )}
          {route === 'profile' && <ProfileMobile user={user!} nav={go} />}
        </div>
        <MobileTabBar route={route} go={go} />
      </div>
    );
  };

  return (
    <div className="tr-root paper-bg" style={{ minHeight: '100vh', position: 'relative' }}>
      {isMobile ? renderMobileContent() : renderDesktopContent()}
    </div>
  );
};

// ── Main app ──────────────────────────────────────────────────────────────────
export const TheReadApp: React.FC = () => (
  <AuthProvider>
    <AppInner />
  </AuthProvider>
);
