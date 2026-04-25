import React from 'react';
import { Avatar, NeuButton, NeuCard, Pill, SectionHeading } from '../components/ui';
import { Icon } from '../components/Icon';
import { POSTS, ANNOUNCEMENTS, SCHEDULE_TODAY, TRENDING, tagById } from '../data';
import type { Author, Post } from '../types';

// ── Greeting hero ─────────────────────────────────────────────────────────────
const GreetingHero: React.FC<{ user: Author; compact?: boolean }> = ({ user, compact = false }) => {
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return (
    <div className="neu tr-fade-up" style={{
      borderRadius: 'var(--radius)',
      padding: compact ? 20 : '28px 32px',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, var(--paper), var(--paper-2))',
    }}>
      <div className="tr-serif" style={{
        position: 'absolute', right: -20, bottom: -30,
        fontSize: compact ? 140 : 220, color: 'var(--tan)', opacity: .09,
        fontStyle: 'italic', fontWeight: 700, lineHeight: 1, pointerEvents: 'none',
      }}>R</div>
      <div className="tr-mono" style={{ fontSize: 10, letterSpacing: '.25em', color: 'var(--tan-2)', textTransform: 'uppercase', marginBottom: 8 }}>
        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · Vol. CXXIX
      </div>
      <h1 className="tr-serif" style={{
        margin: 0, fontSize: compact ? 28 : 40, fontWeight: 500,
        color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.1,
      }}>
        {greet}, <em style={{ fontWeight: 400, color: 'var(--burgundy)' }}>{user.name.split(' ')[0]}.</em>
      </h1>
      <p style={{ margin: '8px 0 0', color: 'var(--ink-2)', fontSize: compact ? 13 : 15, maxWidth: 560, lineHeight: 1.5 }}>
        Three new essays from the editorial board, and your draft has been saved. The library is open late tonight.
      </p>
      {!compact && (
        <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
          <NeuButton primary icon="feather">Continue your draft</NeuButton>
          <NeuButton icon="feed">Today's read</NeuButton>
          <div style={{ flex: 1 }} />
          <div className="neu-inset" style={{
            padding: '10px 16px', borderRadius: 14,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <Icon name="flame" size={16} stroke="var(--burgundy)" />
            <span className="tr-mono" style={{ fontSize: 11, color: 'var(--ink-2)', letterSpacing: '.1em' }}>READING STREAK</span>
            <span className="tr-serif" style={{ fontSize: 22, fontWeight: 600, color: 'var(--burgundy)' }}>23</span>
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>days</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Featured post card ────────────────────────────────────────────────────────
const FeaturedPostCard: React.FC<{ post: Post; onOpen: (p: Post) => void }> = ({ post, onOpen }) => (
  <div className="neu hover-lift" onClick={() => onOpen(post)} style={{
    borderRadius: 'var(--radius)', overflow: 'hidden', cursor: 'pointer',
    display: 'flex', flexDirection: 'column',
  }}>
    <div style={{
      height: 200, background: post.cover,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fbf8f2', fontSize: 72, fontFamily: "'Fraunces',serif", opacity: .95,
      position: 'relative',
    }}>
      <div style={{ opacity: .5 }}>{post.coverAccent}</div>
      {post.featured && (
        <div style={{
          position: 'absolute', top: 14, left: 14,
          background: 'rgba(10,6,5,.4)', backdropFilter: 'blur(10px)',
          color: '#fbf8f2', padding: '5px 12px', borderRadius: 999,
          fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', fontWeight: 600,
          border: '1px solid rgba(255,220,180,.2)',
        }}>Editor's Pick</div>
      )}
    </div>
    <div style={{ padding: '22px 24px 24px' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {post.tags.map(t => { const tag = tagById(t); return <Pill key={t} color={tag.hue} small>{tag.name}</Pill>; })}
      </div>
      <h3 className="tr-serif" style={{ margin: 0, fontSize: 22, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.01em', lineHeight: 1.25 }}>{post.title}</h3>
      <p style={{ margin: '8px 0 14px', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.excerpt}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar user={post.author} size={32} />
        <div style={{ flex: 1, lineHeight: 1.2 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{post.author.name}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{post.author.dept} · {post.readTime} min read</div>
        </div>
        <div style={{ display: 'flex', gap: 12, color: 'var(--ink-3)', fontSize: 12, alignItems: 'center' }}>
          <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><Icon name="eye" size={13} />{post.views}</span>
          <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><Icon name="heart" size={13} />{post.reactions}</span>
        </div>
      </div>
    </div>
  </div>
);

// ── Dashboard Desktop ─────────────────────────────────────────────────────────
export const DashboardDesktop: React.FC<{ user: Author; nav: (r: any, p?: Post) => void }> = ({ user, nav }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, padding: '28px 32px', paddingBottom: 40 }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <GreetingHero user={user} />

      <div>
        <SectionHeading
          eyebrow="Featured this week"
          title="From the editorial desk"
          action={<NeuButton small icon="arrow-right" onClick={() => nav('feed')}>All essays</NeuButton>}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {POSTS.filter(p => p.featured).slice(0, 2).map(p => (
            <FeaturedPostCard key={p.id} post={p} onOpen={p => nav('post', p)} />
          ))}
        </div>
      </div>

      <div>
        <SectionHeading eyebrow="Continue reading" title="Your shelf" />
        <NeuCard>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{
              width: 80, height: 110, borderRadius: 6,
              background: POSTS[2].cover,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fbf8f2', fontSize: 38, fontFamily: "'Fraunces',serif", opacity: .9,
              boxShadow: '3px 3px 8px var(--sh-hi)', flexShrink: 0,
            }}>{POSTS[2].coverAccent}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="tr-mono" style={{ fontSize: 10, color: 'var(--tan-2)', letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 4 }}>Left off · 2 min remaining</div>
              <h3 className="tr-serif" style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 600 }}>{POSTS[2].title}</h3>
              <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--ink-2)' }}>{POSTS[2].excerpt}</p>
              <div className="neu-inset" style={{ height: 6, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: '62%', height: '100%', background: 'linear-gradient(90deg, var(--tan), var(--burgundy))', borderRadius: 3 }} />
              </div>
            </div>
            <NeuButton icon="arrow-right" onClick={() => nav('post', POSTS[2])}>Resume</NeuButton>
          </div>
        </NeuCard>
      </div>
    </div>

    {/* Right rail */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <NeuCard>
        <SectionHeading eyebrow="Thursday · April 23" title="Today" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {SCHEDULE_TODAY.map((s, i) => (
            <div key={i} style={{
              display: 'flex', gap: 14, alignItems: 'center',
              padding: '11px 14px', borderRadius: 12,
              background: s.highlight ? 'var(--accent-soft)' : 'transparent',
              border: s.highlight ? '1px solid rgba(122,46,46,.25)' : '1px solid transparent',
            }}>
              <div className="tr-mono" style={{ fontSize: 13, fontWeight: 600, color: s.highlight ? 'var(--burgundy)' : 'var(--ink-2)', minWidth: 44 }}>{s.time}</div>
              <div style={{ width: 1, height: 28, background: s.highlight ? 'var(--burgundy)' : 'var(--line)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{s.title}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{s.room}</div>
              </div>
            </div>
          ))}
        </div>
      </NeuCard>

      <NeuCard>
        <SectionHeading eyebrow="Campus · Editorial" title="Announcements" />
        {ANNOUNCEMENTS.map(a => (
          <div key={a.id} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
            <div className="neu-flat" style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--burgundy)' }}>
              <Icon name={a.pinned ? 'pin' : a.kind === 'Event' ? 'sparkle' : a.kind === 'Editorial' ? 'feather' : 'globe'} size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span className="tr-mono" style={{ fontSize: 9, letterSpacing: '.2em', color: 'var(--tan-2)', textTransform: 'uppercase' }}>{a.kind}</span>
                <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>· {a.time}</span>
              </div>
              <div className="tr-serif" style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>{a.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>{a.body}</div>
            </div>
          </div>
        ))}
      </NeuCard>

      <NeuCard>
        <SectionHeading eyebrow="Most read · this week" title="Trending" />
        {TRENDING.map((t, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', alignItems: 'flex-start', borderBottom: i < 3 ? '1px solid var(--line)' : 'none' }}>
            <div className="tr-serif" style={{ fontSize: 26, fontWeight: 500, color: 'var(--tan-2)', lineHeight: 1, fontStyle: 'italic', width: 26 }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div className="tr-serif" style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3, marginBottom: 2 }}>{t.title}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{t.author} · {t.reads} reads</div>
            </div>
          </div>
        ))}
      </NeuCard>
    </div>
  </div>
);

// ── Dashboard Mobile ──────────────────────────────────────────────────────────
export const DashboardMobile: React.FC<{ user: Author; nav: (r: any, p?: Post) => void }> = ({ user, nav }) => (
  <div style={{ padding: '14px 16px 90px', display: 'flex', flexDirection: 'column', gap: 16 }}>
    <GreetingHero user={user} compact />
    <div className="neu-inset" style={{ padding: '10px 14px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
      <Icon name="flame" size={15} stroke="var(--burgundy)" />
      <span style={{ fontSize: 11, color: 'var(--ink-2)' }}>Reading streak</span>
      <span className="tr-serif" style={{ fontSize: 18, fontWeight: 600, color: 'var(--burgundy)', marginLeft: 'auto' }}>23 days</span>
    </div>
    <div>
      <SectionHeading eyebrow="Editor's desk" title="This week" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {POSTS.filter(p => p.featured).slice(0, 2).map(p => (
          <FeaturedPostCard key={p.id} post={p} onOpen={p => nav('post', p)} />
        ))}
      </div>
    </div>
    <NeuCard>
      <SectionHeading eyebrow="Today" title="Schedule" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {SCHEDULE_TODAY.slice(0, 3).map((s, i) => (
          <div key={i} style={{
            display: 'flex', gap: 14, alignItems: 'center',
            padding: '11px 14px', borderRadius: 12,
            background: s.highlight ? 'var(--accent-soft)' : 'transparent',
            border: s.highlight ? '1px solid rgba(122,46,46,.25)' : '1px solid transparent',
          }}>
            <div className="tr-mono" style={{ fontSize: 13, fontWeight: 600, color: s.highlight ? 'var(--burgundy)' : 'var(--ink-2)', minWidth: 44 }}>{s.time}</div>
            <div style={{ width: 1, height: 28, background: s.highlight ? 'var(--burgundy)' : 'var(--line)' }} />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{s.title}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{s.room}</div>
            </div>
          </div>
        ))}
      </div>
    </NeuCard>
  </div>
);
