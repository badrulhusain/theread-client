import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/badge';
import { blogService } from '@/services/blog.service';
import { apiMessage } from '@/lib/api';
import type { Blog } from '@/types/blog';

const canEdit = (status: string) => status === 'DRAFT' || status === 'REVISION_REQUESTED';

export default function MyBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState('');

  function load() {
    setLoading(true);
    blogService.listMine({ page, limit: 10 })
      .then((result) => {
        setBlogs(result.items);
        setTotalPages(result.totalPages);
      })
      .catch((error) => toast.error(apiMessage(error, 'Could not load your blogs.')))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page]);

  async function submit(id: string) {
    setSubmittingId(id);
    try {
      await blogService.submit(id);
      toast.success('Submitted for review.');
      load();
    } catch (error) {
      toast.error(apiMessage(error, 'Could not submit this blog.'));
    } finally {
      setSubmittingId('');
    }
  }

  if (loading) return <p className="text-[#74685f]">Loading your blogs...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-semibold">My blogs</h2><Button asChild><Link to="/write">New draft</Link></Button></div>
      {blogs.length ? blogs.map((blog) => (
        <Card key={blog.id}>
          <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2"><h3 className="line-clamp-1 font-semibold">{blog.title}</h3><StatusBadge status={blog.status} /></div>
              <p className="mt-1 line-clamp-2 text-sm text-[#74685f]">{blog.excerpt || 'No excerpt.'}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {canEdit(blog.status) && <Button asChild variant="outline" size="sm"><Link to={`/my-blogs/${blog.id}/edit`}>Edit</Link></Button>}
              {canEdit(blog.status) && <Button size="sm" disabled={submittingId === blog.id} onClick={() => void submit(blog.id)}>{submittingId === blog.id ? 'Submitting...' : 'Submit'}</Button>}
              <Button asChild variant="ghost" size="sm"><Link to={`/my-blogs/${blog.id}`}>Status</Link></Button>
            </div>
          </CardContent>
        </Card>
      )) : <Card><CardContent className="text-[#74685f]">No blogs yet. Start with a draft.</CardContent></Card>}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
