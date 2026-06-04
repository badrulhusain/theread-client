import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { blogService } from '@/services/blog.service';
import type { Blog } from '@/types/blog';

export default function BlogStatusPage() {
  const { id = '' } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogService.getMine(id).then(setBlog).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-slate-500">Loading blog status...</p>;
  if (!blog) return <Card><CardContent className="text-slate-500">Blog not found.</CardContent></Card>;
  const editable = blog.status === 'DRAFT' || blog.status === 'REVISION_REQUESTED';

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div><h2 className="text-2xl font-semibold">{blog.title}</h2><div className="mt-2"><StatusBadge status={blog.status} /></div></div>
        {editable && <Button asChild><Link to={`/my-blogs/${blog.id}/edit`}>Edit blog</Link></Button>}
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-slate-600">{blog.excerpt}</p>
        <section><h3 className="font-semibold">Editor comments</h3>
          {blog.reviewComments?.length ? (
            <div className="mt-3 space-y-3">{blog.reviewComments.map((comment) => <div key={comment.id} className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">{comment.comment}</div>)}</div>
          ) : <p className="mt-2 text-sm text-slate-500">No editor comments yet.</p>}
        </section>
        <section><h3 className="font-semibold">Content snapshot</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{blog.content}</p></section>
      </CardContent>
    </Card>
  );
}
