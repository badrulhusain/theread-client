import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BlogCard } from '@/components/blog/BlogCard';
import { blogService } from '@/services/blog.service';
import { useAuth } from '@/store/authStore';
import type { Blog, BlogStats } from '@/types/blog';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<BlogStats>({});
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      blogService.getDashboardStats().catch(() => ({})),
      blogService.listMine({ page: 1, limit: 5 }).catch(() => ({ items: [], total: 0, totalPages: 1 })),
    ]).then(([nextStats, mine]) => {
      setStats(nextStats);
      setBlogs(mine.items);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-2xl font-semibold">Welcome, {user?.name}</h2><p className="text-sm text-slate-500">Here is your writing pipeline.</p></div>
        <Button asChild><Link to="/write">New draft</Link></Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Submitted" value={stats.totalSubmitted ?? 0} />
        <Stat label="Drafts" value={stats.draftCount ?? 0} />
        <Stat label="Under review" value={stats.underReviewCount ?? 0} />
        <Stat label="Published" value={stats.publishedCount ?? 0} />
      </div>
      <section>
        <h3 className="mb-3 text-lg font-semibold">Recent blogs</h3>
        {loading ? <p className="text-slate-500">Loading recent blogs...</p> : blogs.length ? (
          <div className="grid gap-4">{blogs.map((blog) => <BlogCard key={blog.id} blog={blog} showStatus />)}</div>
        ) : (
          <Card><CardContent className="text-slate-500">You have not created any blogs yet.</CardContent></Card>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <Card><CardContent><div className="text-3xl font-semibold">{value}</div><div className="mt-1 text-sm text-slate-500">{label}</div></CardContent></Card>;
}
