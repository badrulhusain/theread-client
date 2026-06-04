import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BlogCard } from '@/components/blog/BlogCard';
import { showApiError } from '@/lib/api';
import { blogService } from '@/services/blog.service';
import { useAuth } from '@/store/authStore';
import type { Blog, BlogStats } from '@/types/blog';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<BlogStats>({});
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function loadDashboard() {
    setLoading(true);
    setError('');
    blogService.userDashboard()
      .then((summary) => {
        setStats(summary.stats);
        setBlogs(summary.recentItems);
      })
      .catch((err) => {
        setError('Could not load your dashboard summary.');
        showApiError(err, 'Could not load your dashboard summary.');
      })
      .finally(() => setLoading(false));
  }

  useEffect(loadDashboard, []);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a9793d]">Writer desk</p>
          <h2 className="mt-1 font-serif text-4xl font-semibold tracking-tight text-[#231b17]">Welcome, {user?.name}</h2>
          <p className="mt-2 text-sm text-[#74685f]">Here is your writing pipeline.</p>
        </div>
        <Button asChild><Link to="/write">New draft</Link></Button>
      </div>
      {error && <RetryMessage message={error} onRetry={loadDashboard} />}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Drafts" value={count(stats.drafts, stats.draftCount)} loading={loading} />
        <Stat label="Submitted" value={count(stats.submitted, stats.submittedCount, stats.totalSubmitted)} loading={loading} />
        <Stat label="Under review" value={count(stats.underReview, stats.underReviewCount)} loading={loading} />
        <Stat label="Revision requested" value={count(stats.revisionRequested, stats.revisionRequestedCount)} loading={loading} />
        <Stat label="Approved" value={count(stats.approved, stats.approvedCount)} loading={loading} />
        <Stat label="Published" value={count(stats.published, stats.publishedCount)} loading={loading} />
        <Stat label="Rejected" value={count(stats.rejected, stats.rejectedCount)} loading={loading} />
      </div>
      <section>
        <h3 className="mb-3 font-serif text-2xl font-semibold text-[#231b17]">Recent blogs</h3>
        {loading ? <SkeletonList /> : blogs.length ? (
          <div className="grid gap-4">{blogs.map((blog) => <BlogCard key={blog.id} blog={blog} showStatus />)}</div>
        ) : (
          <Card><CardContent className="text-[#74685f]">You have not created any blogs yet.</CardContent></Card>
        )}
      </section>
    </div>
  );
}

function count(...values: Array<number | undefined>) {
  return values.find((value) => typeof value === 'number') ?? 0;
}

function Stat({ label, value, loading }: { label: string; value: number; loading: boolean }) {
  return <Card><CardContent>{loading ? <div className="h-10 w-16 animate-pulse rounded bg-[#eee6da]" /> : <div className="font-serif text-4xl font-semibold text-[#7b2d32]">{value}</div>}<div className="mt-1 text-sm font-medium text-[#74685f]">{label}</div></CardContent></Card>;
}

function SkeletonList() {
  return <div className="grid gap-4">{[1, 2].map((item) => <div key={item} className="h-44 animate-pulse rounded-2xl border border-[#ded3c4] bg-[#fbf7ef]" />)}</div>;
}

function RetryMessage({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <Card><CardContent className="flex flex-wrap items-center justify-between gap-3 text-[#74685f]"><span>{message}</span><Button variant="outline" onClick={onRetry}>Retry</Button></CardContent></Card>;
}
