import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import type { Blog } from '@/types/blog';

export function BlogCard({ blog, showStatus = false }: { blog: Blog; showStatus?: boolean }) {
  const target = blog.slug ? `/blogs/${blog.slug}` : `/my-blogs/${blog.id}`;
  return (
    <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <Link to={target} className="line-clamp-2 text-xl font-semibold tracking-tight hover:underline">{blog.title}</Link>
          {showStatus && <StatusBadge status={blog.status} />}
        </div>
        <p className="line-clamp-3 text-sm leading-6 text-slate-600">{blog.excerpt || 'No excerpt yet.'}</p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span>{blog.author?.name ?? 'The Read'}</span>
          <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(blog.publishedAt ?? blog.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function formatDate(value?: string | null) {
  if (!value) return 'Unscheduled';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}
