import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/components/blog/BlogCard';
import { CommentSection } from '@/components/comments/CommentSection';
import { coverImageAlt, coverImageUrl, normalizeCategoryName, normalizeTagName, readingTime, sanitizeHtml, wordCount } from '@/lib/blog-content';
import { blogService } from '@/services/blog.service';
import type { Blog } from '@/types/blog';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function BlogDetailPage() {
  const { slug = '' } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setError('');
    setBlog(null);
    setLoading(true);
    blogService.getPublishedBySlug(slug)
      .then(setBlog)
      .catch((err) => setError(err?.response?.status === 404 ? 'Blog not found.' : 'Could not load this blog.'))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!blog) return;
    document.title = blog.seoTitle || blog.title;
    const description = blog.seoDescription || blog.excerpt;
    if (!description) return;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
  }, [blog]);

  const html = useMemo(() => addHeadingIds(sanitizeHtml(blog?.content ?? '')), [blog?.content]);
  const toc = useMemo(() => buildToc(html), [html]);
  const category = normalizeCategoryName(blog?.category);
  const tags = (blog?.tags ?? []).map(normalizeTagName).filter(Boolean);
  const coverUrl = blog ? coverImageUrl(blog) : '';

  if (loading) return <main className="mx-auto max-w-4xl px-4 py-10"><div className="h-80 animate-pulse rounded-2xl border border-[#ded3c4] bg-[#fbf7ef]" /></main>;
  if (error || !blog) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Card><CardContent><p className="text-[#5c4b3d]">{error || 'Blog not found.'}</p><Button asChild className="mt-4"><Link to="/blogs">Back to blogs</Link></Button></CardContent></Card>
      </main>
    );
  }

  return (
    <main className="pb-24 md:pb-10">
      <div className="fixed left-0 top-0 z-50 h-1 bg-[#7b2d32] transition-all" style={{ width: `${progress}%` }} />
      <article className="mx-auto max-w-4xl px-4 py-10">
        {coverUrl && <img src={coverUrl} alt={coverImageAlt(blog)} loading="eager" className="mb-8 aspect-[16/7] w-full rounded-2xl border border-[#ded3c4] object-cover shadow-sm" />}
        <div className="flex flex-wrap gap-2">
          {category && <span className="rounded-full bg-[#eee6da] px-3 py-1 text-xs font-semibold text-[#7b2d32]">{category}</span>}
          {tags.map((tag) => <span key={tag} className="rounded-full border border-[#ded3c4] px-3 py-1 text-xs font-medium text-[#74685f]">{tag}</span>)}
        </div>
        <p className="mt-4 text-sm font-medium text-[#a19184]">{blog.author?.name ?? 'The Read'} · {formatDate(blog.publishedAt ?? blog.createdAt)} · {readingTime(blog.content ?? '')} · {wordCount(blog.content ?? '')} words{typeof blog.commentsCount === 'number' ? ` · ${blog.commentsCount} comments` : ''}</p>
        <h1 className="mt-3 max-w-3xl font-serif text-5xl font-semibold leading-tight tracking-tight text-[#231b17] md:text-6xl">{blog.title}</h1>
        {blog.excerpt && <p className="mt-5 max-w-3xl font-serif text-xl italic leading-8 text-[#5c4b3d]">{blog.excerpt}</p>}
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="prose-read max-w-none font-serif text-lg leading-9 text-[#231b17]" dangerouslySetInnerHTML={{ __html: html }} />
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card>
              <CardContent>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a9793d]">Author</p>
                <div className="mt-3 flex items-center gap-3">
                  {blog.author?.avatarUrl ? (
                    <img src={blog.author.avatarUrl} alt="" loading="lazy" className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#53693a] font-serif font-semibold text-[#fffaf1]">{initials(blog.author?.name)}</span>
                  )}
                  <div>
                    <p className="font-serif text-xl font-semibold text-[#231b17]">{blog.author?.name ?? 'The Read'}</p>
                    <p className="text-sm text-[#74685f]">{blog.author?.email ?? 'Published through The Read editorial desk.'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {toc.length > 0 && (
              <Card>
                <CardContent>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a9793d]">Contents</p>
                  <nav className="mt-3 space-y-2 text-sm">
                    {toc.map((item) => <a key={item.id} href={`#${item.id}`} className={`block text-[#74685f] hover:text-[#7b2d32] ${item.level === 3 ? 'pl-3' : ''}`}>{item.text}</a>)}
                  </nav>
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </article>
      <CommentSection slug={slug} initialCount={blog.commentsCount} />
    </main>
  );
}

function addHeadingIds(html: string) {
  if (!html || typeof window === 'undefined') return html;
  const documentFragment = new DOMParser().parseFromString(html, 'text/html');
  documentFragment.querySelectorAll('h2, h3').forEach((heading, index) => {
    if (!heading.id) heading.id = `section-${index + 1}`;
  });
  return documentFragment.body.innerHTML;
}

function buildToc(html: string): TocItem[] {
  if (!html || typeof window === 'undefined') return [];
  const documentFragment = new DOMParser().parseFromString(html, 'text/html');
  return Array.from(documentFragment.querySelectorAll('h2, h3')).map((heading, index) => ({
    id: heading.id || `section-${index + 1}`,
    text: heading.textContent ?? '',
    level: heading.tagName === 'H3' ? 3 : 2,
  })).filter((item) => item.text.trim());
}

function initials(name?: string) {
  return (name ?? 'TR').split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}
