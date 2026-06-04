import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/components/blog/BlogCard';
import { blogService } from '@/services/blog.service';
import type { Blog } from '@/types/blog';

export default function BlogDetailPage() {
  const { slug = '' } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    blogService.getPublishedBySlug(slug)
      .then(setBlog)
      .catch((err) => setError(err?.response?.status === 404 ? 'Blog not found.' : 'Could not load this blog.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <main className="mx-auto max-w-3xl px-4 py-10 text-slate-500">Loading blog...</main>;
  if (error || !blog) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Card><CardContent><p className="text-slate-700">{error || 'Blog not found.'}</p><Button asChild className="mt-4"><Link to="/blogs">Back to blogs</Link></Button></CardContent></Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      {blog.coverImage && <img src={blog.coverImage} alt="" className="mb-8 aspect-[16/7] w-full rounded-lg object-cover" />}
      <p className="text-sm text-slate-500">{blog.author?.name ?? 'The Read'} · {formatDate(blog.publishedAt ?? blog.createdAt)}</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">{blog.title}</h1>
      {blog.excerpt && <p className="mt-4 text-lg leading-8 text-slate-600">{blog.excerpt}</p>}
      <article className="prose prose-slate mt-8 max-w-none whitespace-pre-wrap leading-8 text-slate-800">{blog.content}</article>
    </main>
  );
}
