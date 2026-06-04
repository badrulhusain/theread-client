import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { apiMessage } from '@/lib/api';
import { blogService } from '@/services/blog.service';
import type { Blog, BlogStatus } from '@/types/blog';

const statusMessages: Record<BlogStatus, string> = {
  DRAFT: 'You can edit and submit.',
  SUBMITTED: 'Waiting for editor.',
  UNDER_REVIEW: 'Editor is reviewing.',
  REVISION_REQUESTED: 'Revision requested. Please edit and resubmit.',
  APPROVED: 'Approved. Waiting for admin publish.',
  REJECTED: 'Rejected.',
  PUBLISHED: 'Published.',
  UNPUBLISHED: 'Unpublished.',
  ARCHIVED: 'Archived.',
};

export default function BlogStatusPage() {
  const { id = '' } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogService.getMine(id)
      .then(setBlog)
      .catch((error) => toast.error(apiMessage(error, 'Could not load blog status.')))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-[#74685f]">Loading blog status...</p>;
  if (!blog) return <Card><CardContent className="text-[#74685f]">Blog not found.</CardContent></Card>;
  const editable = blog.status === 'DRAFT' || blog.status === 'REVISION_REQUESTED';

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div><h2 className="text-2xl font-semibold">{blog.title}</h2><div className="mt-2"><StatusBadge status={blog.status} /></div></div>
        {editable && <Button asChild><Link to={`/my-blogs/${blog.id}/edit`}>Edit blog</Link></Button>}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-xl bg-[#eee6da] p-3 text-sm font-medium text-[#5c4b3d]">{statusMessages[blog.status]}</div>
        <p className="text-[#5c4b3d]">{blog.excerpt}</p>
        <section><h3 className="font-semibold">Editor comments</h3>
          {blog.reviewComments?.length ? (
            <div className="mt-3 space-y-3">{blog.reviewComments.map((comment) => <div key={comment.id} className="rounded-xl bg-[#eee6da] p-3 text-sm text-[#5c4b3d]">{comment.comment}</div>)}</div>
          ) : <p className="mt-2 text-sm text-[#74685f]">No editor comments yet.</p>}
        </section>
        <section><h3 className="font-semibold">Content snapshot</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#5c4b3d]">{blog.content}</p></section>
      </CardContent>
    </Card>
  );
}
