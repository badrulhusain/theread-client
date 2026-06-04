import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { BlogCard } from '@/components/blog/BlogCard';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Card, CardContent } from '@/components/ui/card';
import { blogService } from '@/services/blog.service';
import type { Blog } from '@/types/blog';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setDebounced(search);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    blogService.listPublished({ page, limit: 10, search: debounced })
      .then((result) => {
        if (!active) return;
        setBlogs(result.items);
        setTotalPages(result.totalPages);
      })
      .catch(() => active && setError('Could not load blogs. The backend may be offline.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [debounced, page]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Published blogs</h1>
        <div className="relative mt-4 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title" />
        </div>
      </div>
      {error && <Card className="mb-4"><CardContent className="text-red-600">{error}</CardContent></Card>}
      {loading ? <div className="text-slate-500">Loading blogs...</div> : blogs.length ? (
        <div className="grid gap-4">{blogs.map((blog) => <BlogCard key={blog.id} blog={blog} />)}</div>
      ) : (
        <Card><CardContent className="text-slate-500">No published blogs match this search.</CardContent></Card>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </main>
  );
}
