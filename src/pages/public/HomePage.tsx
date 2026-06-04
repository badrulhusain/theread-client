import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BlogCard } from '@/components/blog/BlogCard';
import { blogService } from '@/services/blog.service';
import type { Blog } from '@/types/blog';

export default function HomePage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogService.listPublished({ page: 1, limit: 6 })
      .then((result) => setBlogs(result.items))
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 md:grid-cols-[1.2fr_.8fr] md:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Scalable editorial portal</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">The Read</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              A fast, role-aware blog portal for writers, editors, admins, and readers.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link to="/blogs">Read latest <ArrowRight className="h-4 w-4" /></Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/write"><PenLine className="h-4 w-4" /> Start writing</Link></Button>
            </div>
          </div>
          <Card className="self-center">
            <CardContent className="space-y-4">
              <BookOpen className="h-8 w-8" />
              <h2 className="text-2xl font-semibold">Editorial workflow without the wait.</h2>
              <p className="text-sm leading-6 text-slate-600">Draft, submit, review, approve, publish. Phase 1 keeps every list paginated and every dashboard focused.</p>
            </CardContent>
          </Card>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Latest published</h2>
          <Button asChild variant="ghost"><Link to="/blogs">View all</Link></Button>
        </div>
        {loading ? <div className="text-slate-500">Loading latest blogs...</div> : blogs.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{blogs.map((blog) => <BlogCard key={blog.id} blog={blog} />)}</div>
        ) : (
          <Card><CardContent className="text-slate-500">No published blogs yet.</CardContent></Card>
        )}
      </section>
    </main>
  );
}
