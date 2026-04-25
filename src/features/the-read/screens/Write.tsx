import React, { useState } from 'react';
import { NeuButton, NeuCard, Ornament, Pill } from '../components/ui';
import { Icon } from '../components/Icon';
import { TAGS } from '../data';
import type { Author } from '../types';

// ── Toolbar ───────────────────────────────────────────────────────────────────
const ComposeToolbar: React.FC = () => (
  <div className="neu-flat" style={{ display: 'flex', gap: 4, padding: 6, borderRadius: 12, alignSelf: 'flex-start' }}>
    {[
      { label: 'B', bold: true },
      { label: 'I', italic: true },
      { icon: 'quote' },
      { icon: 'image' },
      { icon: 'tag' },
    ].map((t, i) => (
      <button key={i} className="neu-press" style={{
        width: 34, height: 34, border: 'none', background: 'transparent',
        borderRadius: 8, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--ink-2)',
        fontFamily: "'Fraunces',serif",
        fontWeight: t.bold ? 700 : 400,
        fontStyle: t.italic ? 'italic' : 'normal',
        fontSize: 15,
      }}>
        {t.label ? t.label : <Icon name={t.icon!} size={15} />}
      </button>
    ))}
  </div>
);

// ── Write Desktop ─────────────────────────────────────────────────────────────
export const WriteDesktop: React.FC<{ user: Author; nav: (r: any) => void }> = ({ user, nav }) => {
  const [title, setTitle] = useState('Letters from the Carrel');
  const [excerpt, setExcerpt] = useState('On three months spent at the same desk on the library\'s fourth floor, and what the wood grain taught me.');
  const [body, setBody] = useState('There is a scratch on my desk, third floor west, carrel 14, that I have been trying to decipher for eleven weeks. It looks like a letter — possibly an A, possibly a cursive e. I do not know who put it there, or when, but I know I am the only person alive who has bothered to notice it…');
  const [selectedTags, setSelectedTags] = useState(['t1', 't4']);
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');

  const toggleTag = (id: string) => setSelectedTags(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const wordCount = body.split(/\s+/).filter(Boolean).length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 26, padding: '22px 32px 40px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
          <button onClick={() => nav('feed')} className="neu-flat neu-press" style={{
            border: 'none', padding: '8px 12px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12.5, color: 'var(--ink-2)', cursor: 'pointer', fontFamily: 'Inter,sans-serif', background: 'var(--paper)',
          }}>
            <Icon name="arrow-left" size={14} /> Back
          </button>
          <div className="tr-mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--tan-2)', textTransform: 'uppercase', marginLeft: 8 }}>
            Composing · Draft saved 2m ago
          </div>
          <div style={{ flex: 1 }} />
          <Pill color="var(--moss)">
            <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--moss)', display: 'inline-block' }} /> auto-saved
          </Pill>
        </div>

        <NeuCard style={{ padding: '36px 44px' }}>
          <div className="tr-mono" style={{ fontSize: 10, letterSpacing: '.25em', color: 'var(--tan-2)', textTransform: 'uppercase', marginBottom: 10 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · {user.name}
          </div>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="A title worth the read…"
            style={{
              width: '100%', border: 'none', outline: 'none', background: 'transparent',
              fontFamily: "'Fraunces',serif", fontSize: 40, fontWeight: 600,
              letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 4,
            }}
          />
          <input
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            placeholder="A standfirst — what should the reader know first?"
            style={{
              width: '100%', border: 'none', outline: 'none', background: 'transparent',
              fontFamily: "'Fraunces',serif", fontSize: 18, fontStyle: 'italic',
              color: 'var(--ink-2)', marginBottom: 18,
            }}
          />
          <Ornament size={80} />
          <div style={{ margin: '18px 0 14px' }}>
            <ComposeToolbar />
          </div>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Begin the essay…"
            style={{
              width: '100%', border: 'none', outline: 'none', background: 'transparent',
              fontFamily: "'Fraunces',serif", fontSize: 17, lineHeight: 1.75,
              color: 'var(--ink)', minHeight: 360, resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', gap: 12, color: 'var(--ink-3)', fontSize: 12, marginTop: 12, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
            <span>{wordCount} words</span>
            <span>· ~{Math.max(1, Math.round(wordCount / 200))} min read</span>
            <span style={{ flex: 1 }} />
            <span>Last edited just now</span>
          </div>
        </NeuCard>
      </div>

      {/* Side panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <NeuCard>
          <div className="tr-mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--tan-2)', textTransform: 'uppercase', marginBottom: 12 }}>Publish</div>
          <div className="neu-inset" style={{ display: 'flex', padding: 4, borderRadius: 12, marginBottom: 14 }}>
            {(['DRAFT', 'PUBLISHED'] as const).map(s => (
              <button key={s} onClick={() => setStatus(s)} className={status === s ? 'neu-flat' : ''} style={{
                flex: 1, border: 'none', background: status === s ? 'var(--paper)' : 'transparent',
                padding: '8px 10px', borderRadius: 9,
                fontSize: 12, fontWeight: status === s ? 600 : 500,
                color: status === s ? 'var(--burgundy)' : 'var(--ink-3)',
                cursor: 'pointer', fontFamily: 'Inter,sans-serif',
              }}>{s === 'DRAFT' ? 'Save draft' : 'Publish'}</button>
            ))}
          </div>
          <NeuButton primary icon={status === 'PUBLISHED' ? 'feather' : 'bookmark'} style={{ width: '100%', justifyContent: 'center' }}>
            {status === 'PUBLISHED' ? 'Publish to The Read' : 'Save draft'}
          </NeuButton>
        </NeuCard>

        <NeuCard>
          <div className="tr-mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--tan-2)', textTransform: 'uppercase', marginBottom: 12 }}>Cover</div>
          <div className="neu-inset" style={{
            height: 120, borderRadius: 12,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 6, color: 'var(--ink-3)', cursor: 'pointer',
          }}>
            <Icon name="image" size={24} />
            <span style={{ fontSize: 12 }}>Add a cover</span>
          </div>
        </NeuCard>

        <NeuCard>
          <div className="tr-mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--tan-2)', textTransform: 'uppercase', marginBottom: 12 }}>Tags</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {TAGS.map(t => (
              <button key={t.id} onClick={() => toggleTag(t.id)} className={selectedTags.includes(t.id) ? '' : 'neu-flat neu-press'} style={{
                border: 'none', padding: '6px 12px', borderRadius: 999,
                background: selectedTags.includes(t.id) ? t.hue : undefined,
                color: selectedTags.includes(t.id) ? '#fbf8f2' : 'var(--ink-2)',
                fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif',
                boxShadow: selectedTags.includes(t.id) ? '2px 2px 6px rgba(0,0,0,.15)' : undefined,
              }}>{t.name}</button>
            ))}
          </div>
        </NeuCard>

        <NeuCard>
          <div className="tr-mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--tan-2)', textTransform: 'uppercase', marginBottom: 12 }}>Editorial check</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 12.5 }}>
            {[
              { ok: true, text: 'Title under 80 characters' },
              { ok: true, text: 'Standfirst present' },
              { ok: true, text: 'At least one tag selected' },
              { ok: false, text: 'Cover image recommended' },
            ].map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', color: c.ok ? 'var(--moss)' : 'var(--ink-3)' }}>
                <Icon name={c.ok ? 'check' : 'x'} size={13} /> {c.text}
              </div>
            ))}
          </div>
        </NeuCard>
      </div>
    </div>
  );
};

// ── Write Mobile ──────────────────────────────────────────────────────────────
export const WriteMobile: React.FC<{ user: Author; nav: (r: any) => void }> = ({ user: _user, nav }) => (
  <div style={{ padding: '14px 16px 90px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <button onClick={() => nav('feed')} className="neu-flat" style={{
        border: 'none', padding: '6px 12px', borderRadius: 999,
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 12, color: 'var(--ink-2)', fontFamily: 'Inter,sans-serif', background: 'var(--paper)',
      }}>
        <Icon name="arrow-left" size={13} /> Back
      </button>
      <div style={{ flex: 1 }} />
      <NeuButton small primary>Publish</NeuButton>
    </div>
    <NeuCard style={{ padding: 20 }}>
      <div className="tr-mono" style={{ fontSize: 9, letterSpacing: '.2em', color: 'var(--tan-2)', textTransform: 'uppercase', marginBottom: 8 }}>Draft · auto-saved</div>
      <input defaultValue="Letters from the Carrel" placeholder="A title worth the read…" style={{
        width: '100%', border: 'none', outline: 'none', background: 'transparent',
        fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8,
      }} />
      <input defaultValue="On three months spent at the same desk." placeholder="Standfirst…" style={{
        width: '100%', border: 'none', outline: 'none', background: 'transparent',
        fontFamily: "'Fraunces',serif", fontSize: 14, fontStyle: 'italic', color: 'var(--ink-2)', marginBottom: 12,
      }} />
      <Ornament size={60} />
      <textarea
        defaultValue="There is a scratch on my desk, third floor west, carrel 14, that I have been trying to decipher for eleven weeks…"
        style={{
          width: '100%', border: 'none', outline: 'none', background: 'transparent',
          fontFamily: "'Fraunces',serif", fontSize: 15, lineHeight: 1.7, minHeight: 260, resize: 'none', marginTop: 12,
        }}
      />
    </NeuCard>
    <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {TAGS.slice(0, 6).map(t => (
        <span key={t.id} className="neu-flat" style={{ padding: '6px 11px', borderRadius: 999, fontSize: 11, color: 'var(--ink-2)', background: 'var(--paper)' }}>{t.name}</span>
      ))}
    </div>
  </div>
);
