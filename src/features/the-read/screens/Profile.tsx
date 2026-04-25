import React from 'react';
import { Avatar, NeuButton, NeuCard, SectionHeading } from '../components/ui';
import { Icon } from '../components/Icon';
import { POSTS, tagById } from '../data';
import type { Author, Post } from '../types';

// ── Profile header ────────────────────────────────────────────────────────────
const ProfileHeader: React.FC<{ user: Author; compact?: boolean }> = ({ user, compact = false }) => (
  <div className="neu" style={{ borderRadius: 'var(--radius)', padding: compact ? 20 : '32px 36px', position: 'relative', overflow: 'hidden' }}>
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: compact ? 80 : 120,
      background: 'linear-gradient(135deg, var(--burgundy) 0%, #4a1818 60%, var(--tan-2) 100%)',
      opacity: .85,
    }} />
    <div className="tr-display" style={{
      position: 'absolute', right: 20, top: compact ? -20 : -10,
      fontSize: compact ? 100 : 160, color: 'rgba(245,241,234,.1)',
      fontStyle: 'italic', fontWeight: 700, pointerEvents: 'none', lineHeight: 1,
    }}>R</div>
    <div style={{ position: 'relative', display: 'flex', alignItems: compact ? 'flex-end' : 'center', gap: compact ? 14 : 22, marginTop: compact ? 30 : 50 }}>
      <div style={{ boxShadow: '0 0 0 4px var(--paper)', borderRadius: '50%' }}>
        <Avatar user={user} size={compact ? 72 : 110} />
      </div>
      <div style={{ flex: 1, paddingTop: compact ? 0 : 30 }}>
        <div className="tr-mono" style={{ fontSize: 10, letterSpacing: '.25em', color: 'var(--tan-2)', textTransform: 'uppercase', marginBottom: 4 }}>
          {user.role === 'ADMIN' ? 'Faculty · Editor' : user.role === 'AUTHOR' ? 'Contributor' : 'Reader'} · {user.year}
        </div>
        <h1 className="tr-display" style={{ margin: 0, fontSize: compact ? 24 : 36, fontWeight: 600, letterSpacing: '-0.02em' }}>{user.name}</h1>
        <div style={{ fontSize: compact ? 12 : 14, color: 'var(--ink-2)', marginTop: 4 }}>
          {user.dept} · @{user.name.toLowerCase().replace(/\s/g, '.')}
        </div>
      </div>
      {!compact && (
        <div style={{ display: 'flex', gap: 8, paddingTop: 30 }}>
          <NeuButton icon="settings">Edit profile</NeuButton>
          <NeuButton primary icon="feather">New essay</NeuButton>
        </div>
      )}
    </div>
  </div>
);

// ── Stat tile ─────────────────────────────────────────────────────────────────
const StatTile: React.FC<{ label: string; value: string | number; sub?: string }> = ({ label, value, sub }) => (
  <div className="neu-inset" style={{ padding: '18px 20px', borderRadius: 'calc(var(--radius) * 0.8)', textAlign: 'center' }}>
    <div className="tr-serif" style={{ fontSize: 34, fontWeight: 600, color: 'var(--burgundy)', lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>}
    <div className="tr-mono" style={{ fontSize: 9, letterSpacing: '.2em', color: 'var(--tan-2)', textTransform: 'uppercase', marginTop: 6 }}>{label}</div>
  </div>
);

// ── Profile Desktop ───────────────────────────────────────────────────────────
export const ProfileDesktop: React.FC<{ user: Author; nav: (r: any, p?: Post) => void }> = ({ user, nav }) => {
  const authorPosts = POSTS.filter(p => p.author.id === user.id).slice(0, 3);
  return (
    <div style={{ padding: '28px 32px 60px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <ProfileHeader user={user} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <StatTile label="Essays" value={14} />
        <StatTile label="Followers" value="1.2k" />
        <StatTile label="Following" value={38} />
        <StatTile label="Total reads" value="8.4k" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
        <div>
          <SectionHeading eyebrow="Published" title="Essays" />
          {(authorPosts.length > 0 ? authorPosts : POSTS.slice(0, 3)).map(p => (
            <div key={p.id} className="hover-lift" onClick={() => nav('post', p)} style={{
              display: 'flex', gap: 16, padding: '18px 0', borderBottom: '1px solid var(--line)', cursor: 'pointer',
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: 10, background: p.cover,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fbf8f2', fontSize: 28, flexShrink: 0,
                boxShadow: '2px 2px 8px var(--sh-hi)',
              }}>{p.coverAccent}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                  {p.tags.slice(0, 2).map(t => {
                    const tag = tagById(t);
                    return <span key={t} style={{ fontSize: 10, fontWeight: 600, color: tag.hue }}>{tag.name}</span>;
                  })}
                </div>
                <h4 className="tr-serif" style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 600, lineHeight: 1.25 }}>{p.title}</h4>
                <div style={{ display: 'flex', gap: 12, color: 'var(--ink-3)', fontSize: 11.5 }}>
                  <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><Icon name="eye" size={12} />{p.views}</span>
                  <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><Icon name="heart" size={12} />{p.reactions}</span>
                  <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><Icon name="comment" size={12} />{p.comments}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <NeuCard>
          <div className="tr-mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--tan-2)', textTransform: 'uppercase', marginBottom: 12 }}>About</div>
          <p className="tr-serif" style={{ margin: '0 0 16px', fontSize: 15, lineHeight: 1.6, color: 'var(--ink-2)', fontStyle: 'italic' }}>
            "Writing about the slow pleasures of reading, the campus as a place of thought, and the things you notice when you stop moving."
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'var(--ink-2)' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Icon name="book" size={14} />{user.dept}</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Icon name="globe" size={14} />Ashworth College, Class of 2027</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Icon name="mail" size={14} />
              {user.name.toLowerCase().replace(/\s/g, '.')}@ashworth.edu
            </div>
          </div>
        </NeuCard>
      </div>
    </div>
  );
};

// ── Profile Mobile ────────────────────────────────────────────────────────────
export const ProfileMobile: React.FC<{ user: Author; nav: (r: any, p?: Post) => void }> = ({ user, nav }) => {
  const authorPosts = POSTS.filter(p => p.author.id === user.id);
  return (
    <div style={{ padding: '14px 16px 90px' }}>
      <ProfileHeader user={user} compact />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16, marginBottom: 20 }}>
        <StatTile label="Essays" value={14} />
        <StatTile label="Followers" value="1.2k" />
      </div>
      <SectionHeading eyebrow="Published" title="Essays" />
      {(authorPosts.length > 0 ? authorPosts : POSTS.slice(0, 3)).map(p => (
        <div key={p.id} onClick={() => nav('post', p)} style={{
          display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--line)', cursor: 'pointer',
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: 8, background: p.cover,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fbf8f2', fontSize: 22, flexShrink: 0,
          }}>{p.coverAccent}</div>
          <div style={{ flex: 1 }}>
            <h4 className="tr-serif" style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{p.title}</h4>
            <div style={{ display: 'flex', gap: 10, color: 'var(--ink-3)', fontSize: 11 }}>
              <span>{p.readTime} min</span>
              <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}><Icon name="heart" size={11} />{p.reactions}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
