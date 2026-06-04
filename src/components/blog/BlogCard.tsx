import { Link } from 'react-router-dom';
import { CalendarDays, Clock, Feather, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { excerptFromContent, normalizeCategoryName, normalizeTagName, readingTime } from '@/lib/blog-content';
import type { Blog } from '@/types/blog';

export function BlogCard({ blog, showStatus = false, featured = false }: { blog: Blog; showStatus?: boolean; featured?: boolean }) {
  const target = blog.slug ? `/blogs/${blog.slug}` : `/my-blogs/${blog.id}`;
  const category = normalizeCategoryName(blog.category);
  const tags = (blog.tags ?? []).map(normalizeTagName).filter(Boolean).slice(0, 3);
  const excerpt = blog.excerpt || excerptFromContent(blog.content ?? '') || 'No excerpt yet.';
  return (
    <Card className="group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[14px_14px_34px_rgba(98,69,39,0.16),-8px_-8px_22px_rgba(255,252,243,0.7)]">
      {blog.coverImage ? (
        <img src={blog.coverImage} alt={blog.title} loading="lazy" className={featured ? 'h-48 w-full object-cover' : 'h-28 w-full object-cover'} />
      ) : (
        <div className={featured ? 'h-48 bg-[#7b2d32]' : 'h-28 bg-[#53693a]'} aria-hidden="true">
          <div className="flex h-full items-center justify-center font-serif text-6xl font-bold italic text-[#fffaf1]/35">
            <Feather className="h-12 w-12 stroke-[1.25]" />
          </div>
        </div>
      )}
      <CardContent className="space-y-3">
        {(category || tags.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {category && <span className="rounded-full bg-[#eee6da] px-2.5 py-1 text-xs font-semibold text-[#7b2d32]">{category}</span>}
            {tags.map((tag) => <span key={tag} className="rounded-full border border-[#ded3c4] px-2.5 py-1 text-xs font-medium text-[#74685f]">{tag}</span>)}
          </div>
        )}
        <div className="flex items-start justify-between gap-3">
          <Link to={target} className="line-clamp-2 font-serif text-2xl font-semibold leading-tight tracking-tight text-[#231b17] group-hover:text-[#7b2d32]">{blog.title}</Link>
          {showStatus && <StatusBadge status={blog.status} />}
        </div>
        <p className="line-clamp-3 text-sm leading-6 text-[#74685f]">{excerpt}</p>
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[#a19184]">
          <span>{blog.author?.name ?? 'The Read'}</span>
          <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(blog.publishedAt ?? blog.createdAt)}</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {readingTime(blog.content ?? blog.excerpt ?? '')}</span>
          {typeof blog.commentsCount === 'number' && <span className="inline-flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {blog.commentsCount}</span>}
        </div>
        <Link to={target} className="inline-flex text-sm font-semibold text-[#7b2d32] hover:underline">Read more</Link>
      </CardContent>
    </Card>
  );
}

export function formatDate(value?: string | null) {
  if (!value) return 'Unscheduled';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}
