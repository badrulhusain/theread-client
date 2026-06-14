import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, Clock, Search, Sparkles, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/components/blog/BlogCard';
import { coverImageAlt, coverImageUrl, excerptFromContent, readingTime } from '@/lib/blog-content';
import { blogService, taxonomyService } from '@/services/blog.service';
import { useAuth } from '@/store/authStore';
import type { Blog, BlogCategory } from '@/types/blog';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogService.listPublished({ page: 1, limit: 6 })
      .then((result) => setBlogs(result.items))
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
    taxonomyService.categories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!search.trim()) return;
    const timer = window.setTimeout(() => {
      navigate(`/blogs?search=${encodeURIComponent(search.trim())}`);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [navigate, search]);

  const featured = blogs[0];
  const latest = useMemo(() => blogs.slice(1, 6), [blogs]);
  const secondary = secondaryCta(user?.role);

  return (
    <main className="pb-24 md:pb-0">
      <section className="border-b border-[#ded3c4] bg-[#f4efe6]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 md:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a9793d]">The Read</p>
              <h1 className="mt-2 font-serif text-4xl font-semibold leading-tight tracking-tight text-[#231b17] md:text-5xl">Start reading</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#74685f]">Freshly published stories, essays, and reflections from The Read community.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild><Link to="/blogs">Start reading</Link></Button>
              <Button asChild variant="outline"><Link to={secondary.to}>{secondary.label}</Link></Button>
            </div>
          </div>
          <div className="flex max-w-2xl flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#a19184]" />
              <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search blogs..." />
            </div>
          </div>
        </div>
      </section>
      <section id="latest-blogs" className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a9793d]">Newest first</p>
            <h2 className="mt-1 font-serif text-3xl font-semibold text-[#231b17]">Start with the latest</h2>
          </div>
          <Button asChild variant="ghost"><Link to="/blogs">View all</Link></Button>
        </div>
        {loading ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]"><div className="h-[420px] animate-pulse rounded-2xl border border-[#ded3c4] bg-[#fbf7ef]" /><div className="space-y-3">{[1, 2, 3, 4].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl border border-[#ded3c4] bg-[#fbf7ef]" />)}</div></div>
        ) : featured ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
            <LatestBlog blog={featured} />
            <div className="space-y-3">
              <h3 className="font-serif text-2xl font-semibold text-[#231b17]">More to read</h3>
              {latest.length ? latest.map((blog) => <BlogListItem key={blog.id} blog={blog} />) : <p className="rounded-2xl border border-[#ded3c4] bg-[#fbf7ef] p-4 text-sm text-[#74685f]">No more blogs yet.</p>}
            </div>
          </div>
        ) : (
          <Card><CardContent className="space-y-3 text-[#74685f]"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> No published blogs yet.</div><p>Once editors approve and admins publish articles, they will appear here.</p><Button asChild><Link to="/blogs">Browse blogs</Link></Button></CardContent></Card>
        )}
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-10 md:px-8">
        <div className="flex flex-col gap-4 rounded-2xl border border-[#ded3c4] bg-[#fbf7ef] p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-[#231b17]">Interested in writing?</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#74685f]">Upload your blog draft and send it to the editorial team when it is ready.</p>
          </div>
          <Button asChild><Link to="/write"><UploadCloud className="h-4 w-4" /> Upload a blog</Link></Button>
        </div>
      </section>
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-12 md:px-8">
          <h2 className="mb-3 font-serif text-2xl font-semibold text-[#231b17]">Categories</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => <Link key={category.id} to={`/blogs?categoryId=${category.id}`} className="shrink-0 rounded-full border border-[#ded3c4] bg-[#fbf7ef] px-4 py-2 text-sm font-semibold text-[#7b2d32] hover:border-[#c2a16b]">{category.name}</Link>)}
          </div>
        </section>
      )}
    </main>
  );
}

function secondaryCta(role?: string) {
  if (role === 'EDITOR') return { to: '/editor', label: 'Go to editorial desk' };
  if (role === 'ADMIN') return { to: '/admin', label: 'Go to admin dashboard' };
    return { to: '/write', label: 'Write a blog' };
}

function LatestBlog({ blog }: { blog: Blog }) {
  const target = blog.slug ? `/blogs/${blog.slug}` : `/blogs`;
  const excerpt = blog.excerpt || excerptFromContent(blog.content ?? '', 240);
  const coverUrl = coverImageUrl(blog);

  return (
    <article className="overflow-hidden rounded-2xl border border-[#ded3c4] bg-[#fbf7ef] shadow-[10px_10px_28px_rgba(98,69,39,0.13),-8px_-8px_22px_rgba(255,252,243,0.75)]">
      {coverUrl ? (
        <img src={coverUrl} alt={coverImageAlt(blog)} className="aspect-[16/8] w-full object-cover" />
      ) : (
        <div className="aspect-[16/8] w-full bg-[#53693a]" aria-hidden="true" />
      )}
      <div className="space-y-4 p-5 md:p-7">
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[#a19184]">
          <span>{blog.author?.name ?? 'The Read'}</span>
          <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(blog.publishedAt ?? blog.createdAt)}</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {readingTime(blog.content ?? blog.excerpt ?? '')}</span>
        </div>
        <Link to={target} className="block font-serif text-4xl font-semibold leading-tight tracking-tight text-[#231b17] hover:text-[#7b2d32] md:text-5xl">{blog.title}</Link>
        {excerpt && <p className="max-w-3xl text-base leading-7 text-[#5c4b3d]">{excerpt}</p>}
        <Button asChild><Link to={target}>Read latest</Link></Button>
      </div>
    </article>
  );
}

function BlogListItem({ blog }: { blog: Blog }) {
  const target = blog.slug ? `/blogs/${blog.slug}` : `/blogs`;
  const excerpt = blog.excerpt || excerptFromContent(blog.content ?? '', 120);
  const coverUrl = coverImageUrl(blog);

  return (
    <article className="rounded-2xl border border-[#ded3c4] bg-[#fbf7ef] p-4 transition hover:border-[#c2a16b] hover:bg-[#fffaf1]">
      <div className="flex items-start gap-3">
        {coverUrl && <img src={coverUrl} alt={coverImageAlt(blog)} loading="lazy" className="h-20 w-24 shrink-0 rounded-xl object-cover" />}
        <div className="min-w-0 flex-1">
          <Link to={target} className="line-clamp-2 font-serif text-xl font-semibold leading-tight text-[#231b17] hover:text-[#7b2d32]">{blog.title}</Link>
          {excerpt && <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#74685f]">{excerpt}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-[#a19184]">
            <span>{formatDate(blog.publishedAt ?? blog.createdAt)}</span>
            <span>{readingTime(blog.content ?? blog.excerpt ?? '')}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
