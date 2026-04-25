import React, { useState } from 'react';
import { Avatar, NeuButton, NeuCard } from '../components/ui';
import { Icon } from '../components/Icon';
import { NOTIFICATIONS } from '../data';
import type { Notification } from '../types';

const iconFor = (kind: string) => ({ comment: 'comment', follow: 'user', reaction: 'heart', mention: 'feather', editorial: 'pin' }[kind] ?? 'bell');
const colorFor = (kind: string) => ({ comment: 'var(--burgundy)', follow: 'var(--moss)', reaction: 'var(--tan-2)', mention: 'var(--burgundy)', editorial: 'var(--ink-2)' }[kind] ?? 'var(--ink-2)');

// ── Notification row ──────────────────────────────────────────────────────────
const NotifRow: React.FC<{ n: Notification }> = ({ n }) => (
  <div className={n.unread ? 'neu-flat' : ''} style={{
    display: 'flex', gap: 12, alignItems: 'flex-start',
    padding: '14px 16px', borderRadius: 14,
    background: n.unread ? 'var(--accent-soft)' : 'transparent',
    marginBottom: 8,
    border: n.unread ? '1px solid rgba(122,46,46,.18)' : '1px solid transparent',
  }}>
    {n.actor ? (
      <Avatar user={n.actor} size={40} />
    ) : (
      <div className="neu-flat" style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: colorFor(n.kind), background: 'var(--paper)',
      }}>
        <Icon name={iconFor(n.kind)} size={18} stroke={colorFor(n.kind)} />
      </div>
    )}
    <div style={{ flex: 1, lineHeight: 1.4 }}>
      <div style={{ fontSize: 13.5, color: 'var(--ink)' }}>
        {n.actor && <span style={{ fontWeight: 600 }}>{n.actor.name} </span>}
        <span style={{ color: 'var(--ink-2)' }}>{n.text}</span>
        {n.target && <span className="tr-serif" style={{ fontWeight: 500, fontStyle: 'italic' }}> "{n.target}"</span>}
      </div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 3 }}>{n.time}</div>
    </div>
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {n.unread && <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--burgundy)' }} />}
      <Icon name={iconFor(n.kind)} size={14} stroke={colorFor(n.kind)} />
    </div>
  </div>
);

// ── Notifications Desktop ─────────────────────────────────────────────────────
export const NotificationsDesktop: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const items = NOTIFICATIONS.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return n.unread;
    return n.kind === filter;
  });

  return (
    <div style={{ padding: '28px 32px 60px', maxWidth: 820, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <div className="tr-mono" style={{ fontSize: 10, letterSpacing: '.25em', color: 'var(--tan-2)', textTransform: 'uppercase', marginBottom: 6 }}>Inbox</div>
          <h1 className="tr-display" style={{ margin: 0, fontSize: 40, fontWeight: 600, letterSpacing: '-0.02em' }}>Notifications</h1>
        </div>
        <NeuButton small icon="check">Mark all read</NeuButton>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {[
          { id: 'all', label: 'All' },
          { id: 'unread', label: 'Unread', count: NOTIFICATIONS.filter(n => n.unread).length },
          { id: 'comment', label: 'Comments' },
          { id: 'reaction', label: 'Reactions' },
          { id: 'follow', label: 'Follows' },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={filter === f.id ? 'neu-inset' : 'neu-flat neu-press'}
            style={{
              border: 'none', padding: '7px 14px', borderRadius: 999,
              fontSize: 12.5, fontWeight: filter === f.id ? 600 : 500,
              color: filter === f.id ? 'var(--burgundy)' : 'var(--ink-2)',
              cursor: 'pointer', fontFamily: 'Inter,sans-serif',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--paper)',
            }}
          >
            {f.label}
            {f.count !== undefined && (
              <span style={{ background: 'var(--burgundy)', color: '#fbf8f2', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 999 }}>{f.count}</span>
            )}
          </button>
        ))}
      </div>

      <NeuCard padded={false} style={{ padding: '18px 20px' }}>
        {items.map(n => <NotifRow key={n.id} n={n} />)}
      </NeuCard>
    </div>
  );
};

// ── Notifications Mobile ──────────────────────────────────────────────────────
export const NotificationsMobile: React.FC = () => (
  <div style={{ padding: '14px 16px 90px' }}>
    <h1 className="tr-display" style={{ margin: '0 0 14px', fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>Notifications</h1>
    <NeuCard padded={false} style={{ padding: '10px 12px' }}>
      {NOTIFICATIONS.map(n => <NotifRow key={n.id} n={n} />)}
    </NeuCard>
  </div>
);
