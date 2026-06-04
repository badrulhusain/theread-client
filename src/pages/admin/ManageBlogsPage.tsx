import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/badge';
import { Table } from '@/components/ui/table';
import { apiMessage } from '@/lib/api';
import { adminService } from '@/services/admin.service';
import type { Blog, BlogStatus } from '@/types/blog';

const statuses: Array<'' | BlogStatus> = ['', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUESTED', 'APPROVED', 'REJECTED', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED'];

export default function ManageBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setDebounced(search);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  function load() {
    adminService.blogs({ page, limit: 10, search: debounced, ...(status && { status }) }).then((result) => {
      setBlogs(result.items);
      setTotalPages(result.totalPages);
    });
  }

  useEffect(load, [debounced, page, status]);

  async function publish(blog: Blog) {
    if (blog.status !== 'APPROVED') return toast.error('Only approved blogs can be published.');
    try {
      await adminService.publishBlog(blog.id);
      toast.success('Blog published.');
      load();
    } catch (error) {
      toast.error(apiMessage(error, 'Could not publish blog.'));
    }
  }

  async function unpublish(blog: Blog) {
    if (blog.status !== 'PUBLISHED') return toast.error('Only published blogs can be unpublished.');
    try {
      await adminService.unpublishBlog(blog.id);
      toast.success('Blog unpublished.');
      load();
    } catch (error) {
      toast.error(apiMessage(error, 'Could not unpublish blog.'));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Manage blogs</h2>
        <div className="flex w-full gap-2 sm:w-auto">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search blogs" />
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            {statuses.map((item) => <option key={item || 'all'} value={item}>{item ? item.replaceAll('_', ' ') : 'All statuses'}</option>)}
          </Select>
        </div>
      </div>
      <Card>
        <CardContent>
          {blogs.length ? (
            <Table>
              <thead><tr className="border-b text-slate-500"><th className="py-2">Title</th><th>Author</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{blogs.map((blog) => <tr key={blog.id} className="border-b last:border-0"><td className="max-w-[280px] py-3 font-medium"><span className="line-clamp-1">{blog.title}</span></td><td>{blog.author?.name ?? 'Unknown'}</td><td><StatusBadge status={blog.status} /></td><td className="flex flex-wrap gap-2 py-2"><Button size="sm" disabled={blog.status !== 'APPROVED'} onClick={() => void publish(blog)}>Publish</Button><Button size="sm" variant="outline" disabled={blog.status !== 'PUBLISHED'} onClick={() => void unpublish(blog)}>Unpublish</Button></td></tr>)}</tbody>
            </Table>
          ) : <p className="text-slate-500">No blogs found.</p>}
        </CardContent>
      </Card>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
