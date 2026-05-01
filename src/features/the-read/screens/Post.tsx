import React, { useEffect, useState } from 'react';
import { Avatar, Divider, NeuButton, NeuCard, Ornament, Pill } from '../components/ui';
import { Icon } from '../components/Icon';
import { commentsApi } from '../api';
import { formatDate, relTime } from '../data';
import type { Author, ContentBlock, Post } from '../types';
import type { ApiComment } from '../api';

// ── Content block renderer ────────────────────────────────────────────────────
const renderBlock = (block: ContentBlock, i: number) => {
  if (block.type === 'p') return (
    <p key={i} style={{ margin: '0 0 18px', fontSize: 17, lineHeight: 1.75, color: 'var(--ink)', fontFamily: "'Fraunces',serif" }}>{block.text}</p>
  );
  if (block.type === 'h2') return (
    <h2 key={i} className="tr-serif" style={{ margin: '32px 0 16px', fontSize: 26, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{block.text}</h2>
  );
  if (block.type === 'pull') return (
    <aside key={i} style={{
      margin: '28px -10px', padding: '20px 28px',
      borderLeft: '3px solid var(--burgundy)',
      fontFamily: "'Fraunces',serif", fontStyle: 'italic',
      fontSize: 22, lineHeight: 1.45, color: 'var(--burgundy)',
      fontWeight: 400, letterSpacing: '-0.01em',
    }}>
      <Icon name="quote" size={24} stroke="var(--tan-2)" />
      <div style={{ marginTop: 8 }}>{block.text}</div>
    </aside>
  );
  return null;
};

// ── Post actions ──────────────────────────────────────────────────────────────
const PostActions: React.FC<{ post: Post; vertical?: boolean }> = ({ post, vertical = false }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const items = [
    { icon: 'heart', count: post.reactions + (liked ? 1 : 0), active: liked, onClick: () => setLiked(l => !l), color: 'var(--burgundy)' },
    { icon: 'comment', count: post.comments, active: false, onClick: () => {} },
    { icon: 'bookmark', count: undefined, active: saved, onClick: () => setSaved(s => !s), color: 'var(--tan-2)' },
    { icon: 'share', count: undefined, active: false, onClick: () => {} },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 8, alignItems: 'center' }}>
      {items.map((it, i) => (
        <button key={i} onClick={it.onClick}
          className={it.active ? 'neu-inset' : 'neu-flat neu-press hover-lift'}
          style={{
            border: 'none',
            display: 'flex', flexDirection: vertical ? 'column' : 'row',
            gap: vertical ? 2 : 6, alignItems: 'center',
            padding: vertical ? '10px 8px' : '9px 14px',
            borderRadius: vertical ? 14 : 999,
            minWidth: vertical ? 52 : undefined,
            color: it.active ? (it.color ?? 'var(--burgundy)') : 'var(--ink-2)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Inter,sans-serif',
            background: 'var(--paper)',
          }}
        >
          <Icon name={it.icon} size={16} stroke={it.active ? (it.color ?? 'var(--burgundy)') : 'var(--ink-2)'} fill={it.active && it.icon === 'heart' ? (it.color ?? 'var(--burgundy)') : 'none'} />
          {it.count !== undefined && <span style={{ fontSize: vertical ? 10 : 12 }}>{it.count}</span>}
        </button>
      ))}
    </div>
  );
};

// ── Comment row ───────────────────────────────────────────────────────────────
const CommentRow: React.FC<{ comment: ApiComment }> = ({ comment }) => {
  const author: Author = {
    id: comment.author.id,
    name: comment.author.name,
    initials: comment.author.name.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase(),
    role: 'USER',
    dept: '',
    year: '',
  };
  return (
    <div style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
      <Avatar user={author} size={36} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{comment.author.name}</span>
          <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>· {relTime(comment.createdAt)}</span>
        </div>
        <p className="tr-serif" style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: 'var(--ink)' }}>{comment.content}</p>
        <div style={{ display: 'flex', gap: 14, marginTop: 8, color: 'var(--ink-3)', fontSize: 11.5 }}>
          <button style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>Reply</button>
          <button style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>Like</button>
        </div>
      </div>
    </div>
  );
};

// ── Comment box ───────────────────────────────────────────────────────────────
const CommentBox: React.FC<{ user: Author; postId: string; onPosted: () => void }> = ({ user, postId, onPosted }) => {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await commentsApi.create(postId, text.trim());
      setText('');
      onPosted();
    } catch {
      // silent — user may not be authed as AUTHOR/ADMIN
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="neu-inset" style={{ padding: 16, borderRadius: 16, display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 20 }}>
      <Avatar user={user} size={36} />
      <div style={{ flex: 1 }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Share a thought on this essay…"
          style={{
            width: '100%', border: 'none', outline: 'none', background: 'transparent',
            fontFamily: "'Fraunces',serif", fontSize: 15, color: 'var(--ink)',
            minHeight: 50, resize: 'none', lineHeight: 1.5,
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
          <NeuButton small onClick={() => setText('')}>Cancel</NeuButton>
          <NeuButton small primary icon="arrow-right" onClick={submit}>
            {submitting ? 'Posting…' : 'Post'}
          </NeuButton>
        </div>
      </div>
    </div>
  );
};

// ── Post Desktop ──────────────────────────────────────────────────────────────
export const PostDesktop: React.FC<{ post: Post; user: Author; nav: (r: any) => void }> = ({ post, user, nav }) => {
  const [comments, setComments] = useState<ApiComment[]>([]);

  const loadComments = () => {
    commentsApi.listForPost(post.id)
      .then(setComments)
      .catch(() => {});
  };

  useEffect(() => { loadComments(); }, [post.id]);

  return (
    <div style={{ padding: '28px 32px 60px', maxWidth: 900, margin: '0 auto' }}>
      <button onClick={() => nav('feed')} className="neu-flat neu-press" style={{
        border: 'none', padding: '8px 14px', borderRadius: 999,
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 12.5, color: 'var(--ink-2)', cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontWeight: 500,
        marginBottom: 24, background: 'var(--paper)',
      }}>
        <Icon name="arrow-left" size={14} /> Back to feed
      </button>

      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 14 }}>
          {post.tags.map(t => <Pill key={t.id} color={t.hue} small>{t.name}</Pill>)}
        </div>
        <h1 className="tr-display" style={{ margin: '0 0 18px', fontSize: 46, fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.1, color: 'var(--ink)', maxWidth: 720, marginInline: 'auto' }}>
          {post.title}
        </h1>
        <div className="tr-serif" style={{ fontSize: 19, fontStyle: 'italic', color: 'var(--ink-2)', maxWidth: 620, margin: '0 auto 20px', lineHeight: 1.5 }}>
          {post.excerpt}
        </div>
        <Ornament />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginTop: 18 }}>
          <Avatar user={post.author} size={42} ring />
          <div style={{ textAlign: 'left', lineHeight: 1.3 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{post.author.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
              {post.author.dept || post.author.year} · {formatDate(post.createdAt)} · {post.readTime} min read
            </div>
          </div>
          <NeuButton small primary>Follow</NeuButton>
        </div>
      </div>

      <div style={{
        height: 320, borderRadius: 16, background: post.cover,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fbf8f2', fontSize: 120, fontFamily: "'Fraunces',serif",
        marginBottom: 40, boxShadow: '8px 8px 24px var(--sh-hi)',
      }}>
        <div style={{ opacity: .4 }}>{post.coverAccent}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 30 }}>
        <div style={{ position: 'sticky', top: 20, alignSelf: 'start' }}>
          <PostActions post={post} vertical />
        </div>
        <article style={{ maxWidth: 680 }}>
          {(post.content.length > 0 ? post.content : [
            { type: 'p' as const, text: post.excerpt },
            { type: 'p' as const, text: 'This essay is still being drafted. Full text will be available soon.' },
          ]).map(renderBlock)}

          <Divider style={{ margin: '40px 0 24px' }} />

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
            <Icon name="tag" size={14} stroke="var(--ink-3)" />
            {post.tags.map(t => <Pill key={t.id} color={t.hue}>{t.name}</Pill>)}
          </div>

          <NeuCard>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <Avatar user={post.author} size={60} ring />
              <div style={{ flex: 1 }}>
                <div className="tr-mono" style={{ fontSize: 9, letterSpacing: '.2em', color: 'var(--tan-2)', textTransform: 'uppercase', marginBottom: 3 }}>About the author</div>
                <div className="tr-serif" style={{ fontSize: 18, fontWeight: 600, marginBottom: 2 }}>{post.author.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{post.author.year} · {post.author.dept || 'Contributor'}</div>
              </div>
              <NeuButton primary>Follow</NeuButton>
            </div>
          </NeuCard>

          <h3 className="tr-serif" style={{ fontSize: 22, fontWeight: 500, margin: '40px 0 16px' }}>
            {comments.length} {comments.length === 1 ? 'response' : 'responses'}
          </h3>
          <CommentBox user={user} postId={post.id} onPosted={loadComments} />
          {comments.map(c => <CommentRow key={c.id} comment={c} />)}
        </article>
      </div>
    </div>
  );
};

// ── Post Mobile ───────────────────────────────────────────────────────────────
export const PostMobile: React.FC<{ post: Post; nav: (r: any) => void }> = ({ post, nav }) => (
  <div style={{ padding: '14px 18px 90px' }}>
    <button onClick={() => nav('feed')} className="neu-flat" style={{
      border: 'none', padding: '6px 12px', borderRadius: 999,
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 12, color: 'var(--ink-2)', marginBottom: 18, fontFamily: 'Inter,sans-serif', background: 'var(--paper)',
    }}>
      <Icon name="arrow-left" size={13} /> Back
    </button>
    <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
      {post.tags.map(t => <Pill key={t.id} color={t.hue} small>{t.name}</Pill>)}
    </div>
    <h1 className="tr-display" style={{ margin: '0 0 12px', fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15 }}>{post.title}</h1>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
      <Avatar user={post.author} size={32} ring />
      <div style={{ flex: 1, lineHeight: 1.25 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{post.author.name}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{formatDate(post.createdAt)} · {post.readTime} min</div>
      </div>
    </div>
    <div style={{
      height: 180, borderRadius: 14, background: post.cover,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fbf8f2', fontSize: 68, fontFamily: "'Fraunces',serif", marginBottom: 22,
    }}>
      <div style={{ opacity: .4 }}>{post.coverAccent}</div>
    </div>
    <article>
      {(post.content.length > 0 ? post.content : [{ type: 'p' as const, text: post.excerpt }]).map((b, i) => {
        if (b.type === 'p') return <p key={i} className="tr-serif" style={{ margin: '0 0 14px', fontSize: 15, lineHeight: 1.7, color: 'var(--ink)' }}>{b.text}</p>;
        if (b.type === 'h2') return <h2 key={i} className="tr-serif" style={{ margin: '20px 0 10px', fontSize: 19, fontWeight: 500 }}>{b.text}</h2>;
        if (b.type === 'pull') return <aside key={i} style={{ margin: '16px 0', padding: '12px 16px', borderLeft: '3px solid var(--burgundy)', fontFamily: "'Fraunces',serif", fontStyle: 'italic', fontSize: 17, color: 'var(--burgundy)', lineHeight: 1.4 }}>{b.text}</aside>;
        return null;
      })}
    </article>
    <div style={{ position: 'sticky', bottom: 70, zIndex: 10, marginTop: 24 }}>
      <div className="neu" style={{ padding: 10, borderRadius: 999, display: 'flex', justifyContent: 'space-around' }}>
        <PostActions post={post} />
      </div>
    </div>
  </div>
);
