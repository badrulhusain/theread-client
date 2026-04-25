import React, { useState } from 'react';
import { Logo, NeuButton, NeuInput, Ornament } from '../components/ui';

// ── Shared two-column shell ───────────────────────────────────────────────────
const AuthShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%' }}>
    {/* Dark library side */}
    <div style={{
      background: 'linear-gradient(145deg, #3d2a1f 0%, #1e1510 60%, #0f0805 100%)',
      color: '#f5f1ea', padding: '50px 52px',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <div className="tr-display" style={{
        position: 'absolute', right: -40, bottom: -80,
        fontSize: 340, color: 'var(--tan)', opacity: .06,
        fontStyle: 'italic', fontWeight: 700, lineHeight: 1, pointerEvents: 'none',
      }}>R</div>
      <Logo variant="light" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
        <div className="tr-mono" style={{ fontSize: 11, letterSpacing: '.3em', color: 'var(--tan)', textTransform: 'uppercase', marginBottom: 14 }}>
          Est. MDCCCXCVII
        </div>
        <h1 className="tr-display" style={{ margin: 0, fontSize: 60, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1, color: '#fbf8f2' }}>
          Stories <em style={{ fontWeight: 400, color: 'var(--tan)' }}>worth</em><br />the reading.
        </h1>
        <div style={{ marginTop: 18 }}><Ornament color="var(--tan)" /></div>
        <p style={{ margin: '20px 0 0', fontSize: 15, color: 'rgba(245,241,234,.75)', maxWidth: 380, lineHeight: 1.6, fontFamily: "'Fraunces',serif" }}>
          The campus journal of Ashworth College. Essays, letters, and dispatches from students and faculty — since 1897.
        </p>
      </div>
      <div style={{ position: 'relative', zIndex: 2, opacity: .7 }}>
        <div className="tr-mono" style={{ fontSize: 10, letterSpacing: '.25em', color: 'var(--tan)', textTransform: 'uppercase' }}>
          Lectio · Veritas · Lumen
        </div>
      </div>
    </div>

    {/* Form side */}
    <div style={{ background: 'var(--paper)', padding: '50px 52px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {children}
    </div>
  </div>
);

// ── Login Desktop ─────────────────────────────────────────────────────────────
interface LoginProps { onLogin: () => void; onRegister: () => void; }
export const LoginDesktop: React.FC<LoginProps> = ({ onLogin, onRegister }) => {
  const [email, setEmail] = useState('helena.oduya@ashworth.edu');
  const [pw, setPw] = useState('••••••••••');
  return (
    <AuthShell>
      <div style={{ maxWidth: 380, width: '100%', margin: '0 auto' }}>
        <div className="tr-mono" style={{ fontSize: 10, letterSpacing: '.25em', color: 'var(--tan-2)', textTransform: 'uppercase', marginBottom: 10 }}>Sign in</div>
        <h2 className="tr-display" style={{ margin: 0, fontSize: 38, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          Welcome <em style={{ fontWeight: 400, color: 'var(--burgundy)' }}>back.</em>
        </h2>
        <p style={{ margin: '10px 0 28px', color: 'var(--ink-2)', fontSize: 14, fontFamily: "'Fraunces',serif" }}>
          Sign in with your Ashworth credentials to continue.
        </p>
        <label className="tr-mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--ink-3)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
          Campus email
        </label>
        <NeuInput icon="mail" value={email} onChange={setEmail} />
        <div style={{ height: 14 }} />
        <label className="tr-mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--ink-3)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
          Password
        </label>
        <NeuInput icon="lock" value={pw} onChange={setPw} type="password" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12.5, color: 'var(--ink-2)', cursor: 'pointer' }}>
            <span className="neu-inset" style={{ width: 18, height: 18, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--burgundy)' }}>✓</span>
            Remember me
          </label>
          <span style={{ fontSize: 12.5, color: 'var(--burgundy)', cursor: 'pointer', fontWeight: 500 }}>Forgot password?</span>
        </div>
        <div style={{ height: 20 }} />
        <NeuButton primary onClick={onLogin} style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>Sign in</NeuButton>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '22px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          <span className="tr-mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        </div>
        <NeuButton style={{ width: '100%', justifyContent: 'center' }} icon="globe">Sign in with Campus SSO</NeuButton>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-2)', marginTop: 28 }}>
          New to The Read?{' '}
          <span onClick={onRegister} style={{ color: 'var(--burgundy)', fontWeight: 600, cursor: 'pointer' }}>Request an account</span>
        </p>
      </div>
    </AuthShell>
  );
};

// ── Register Desktop ──────────────────────────────────────────────────────────
interface RegisterProps { onLogin: () => void; onBack: () => void; }
export const RegisterDesktop: React.FC<RegisterProps> = ({ onLogin, onBack }) => (
  <AuthShell>
    <div style={{ maxWidth: 380, width: '100%', margin: '0 auto' }}>
      <div className="tr-mono" style={{ fontSize: 10, letterSpacing: '.25em', color: 'var(--tan-2)', textTransform: 'uppercase', marginBottom: 10 }}>Create account</div>
      <h2 className="tr-display" style={{ margin: 0, fontSize: 36, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
        Join <em style={{ fontWeight: 400, color: 'var(--burgundy)' }}>The Read.</em>
      </h2>
      <p style={{ margin: '10px 0 24px', color: 'var(--ink-2)', fontSize: 14, fontFamily: "'Fraunces',serif" }}>
        Open to all students, faculty, and alumni.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div>
          <label className="tr-mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--ink-3)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>First name</label>
          <NeuInput value="Helena" onChange={() => {}} />
        </div>
        <div>
          <label className="tr-mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--ink-3)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Last name</label>
          <NeuInput value="Oduya" onChange={() => {}} />
        </div>
      </div>
      <label className="tr-mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--ink-3)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Campus email</label>
      <NeuInput icon="mail" value="helena.oduya@ashworth.edu" onChange={() => {}} />
      <div style={{ height: 12 }} />
      <label className="tr-mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--ink-3)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Password</label>
      <NeuInput icon="lock" value="••••••••" onChange={() => {}} type="password" />
      <div style={{ height: 20 }} />
      <NeuButton primary onClick={onLogin} style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>Create account</NeuButton>
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-2)', marginTop: 22 }}>
        Already reading?{' '}
        <span onClick={onBack} style={{ color: 'var(--burgundy)', fontWeight: 600, cursor: 'pointer' }}>Sign in</span>
      </p>
    </div>
  </AuthShell>
);

// ── Login Mobile ──────────────────────────────────────────────────────────────
export const LoginMobile: React.FC<LoginProps> = ({ onLogin, onRegister }) => (
  <div style={{
    height: '100%',
    background: 'linear-gradient(160deg, #3d2a1f 0%, #1e1510 100%)',
    color: '#f5f1ea',
    padding: '60px 26px 24px',
    display: 'flex', flexDirection: 'column',
    position: 'relative', overflow: 'hidden',
  }}>
    <div className="tr-display" style={{ position: 'absolute', right: -30, bottom: -80, fontSize: 240, color: 'var(--tan)', opacity: .07, fontStyle: 'italic', fontWeight: 700, pointerEvents: 'none' }}>R</div>
    <div style={{ textAlign: 'center', marginBottom: 40, position: 'relative', zIndex: 2 }}>
      <div style={{ display: 'inline-flex', marginBottom: 20 }}><Logo variant="light" size={48} /></div>
      <div className="tr-mono" style={{ fontSize: 10, letterSpacing: '.3em', color: 'var(--tan)', textTransform: 'uppercase', marginBottom: 10 }}>Welcome back</div>
      <h2 className="tr-display" style={{ margin: 0, fontSize: 30, fontWeight: 600, color: '#fbf8f2', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
        Sign in to <em style={{ fontWeight: 400, color: 'var(--tan)' }}>The Read</em>
      </h2>
    </div>
    <div className="paper-bg" style={{ background: 'var(--paper)', borderRadius: 22, padding: 24, marginTop: 'auto', position: 'relative', zIndex: 2 }}>
      <label className="tr-mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--ink-3)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Email</label>
      <NeuInput icon="mail" value="helena.oduya@ashworth.edu" onChange={() => {}} />
      <div style={{ height: 12 }} />
      <label className="tr-mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--ink-3)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Password</label>
      <NeuInput icon="lock" value="••••••••" onChange={() => {}} type="password" />
      <div style={{ height: 18 }} />
      <NeuButton primary onClick={onLogin} style={{ width: '100%', justifyContent: 'center', padding: '13px' }}>Sign in</NeuButton>
      <p style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--ink-2)', marginTop: 18 }}>
        New here?{' '}
        <span onClick={onRegister} style={{ color: 'var(--burgundy)', fontWeight: 600, cursor: 'pointer' }}>Request account</span>
      </p>
    </div>
  </div>
);
