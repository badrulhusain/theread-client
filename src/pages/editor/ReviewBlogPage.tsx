import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/ui/badge';
import { apiMessage } from '@/lib/api';
import { editorialService } from '@/services/editorial.service';
import { useAuth } from '@/store/authStore';
import type { Blog } from '@/types/blog';

export default function ReviewBlogPage() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState('');

  function load() {
    editorialService.getBlog(id).then(setBlog).finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  const assigned = blog?.editorId === user?.id || blog?.editor?.id === user?.id || user?.role === 'ADMIN';

  async function run(action: 'pick' | 'approve' | 'reject' | 'revision') {
    if ((action === 'reject' || action === 'revision') && !comment.trim()) {
      toast.error('Comment is required for reject or revision request.');
      return;
    }
    setSubmitting(action);
    try {
      if (action === 'pick') await editorialService.pick(id);
      if (action === 'approve') await editorialService.approve(id, comment.trim() || undefined);
      if (action === 'reject') await editorialService.reject(id, comment.trim());
      if (action === 'revision') await editorialService.requestRevision(id, comment.trim());
      toast.success('Review updated.');
      setComment('');
      load();
    } catch (error) {
      toast.error(apiMessage(error, 'Could not update review.'));
    } finally {
      setSubmitting('');
    }
  }

  if (loading) return <p className="text-slate-500">Loading review...</p>;
  if (!blog) return <Card><CardContent className="text-slate-500">Blog not found.</CardContent></Card>;

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h2 className="text-2xl font-semibold">{blog.title}</h2><p className="text-sm text-slate-500">By {blog.author?.name ?? 'Unknown author'}</p></div>
          <StatusBadge status={blog.status} />
        </div>
        <div className="flex flex-wrap gap-2">
          {!assigned && blog.status === 'SUBMITTED' && <Button disabled={submitting === 'pick'} onClick={() => void run('pick')}>Pick for review</Button>}
          {assigned && <Button asChild variant="outline"><Link to={`/editor/blogs/${blog.id}/edit`}>Edit assigned blog</Link></Button>}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-slate-600">{blog.excerpt}</p>
        <article className="whitespace-pre-wrap rounded-md bg-slate-50 p-4 leading-8 text-slate-800">{blog.content}</article>
        {assigned && (
          <div className="space-y-3">
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Decision comment. Required for reject and revision." />
            <div className="flex flex-wrap gap-2">
              <Button disabled={!!submitting} onClick={() => void run('approve')}>{submitting === 'approve' ? 'Approving...' : 'Approve'}</Button>
              <Button variant="outline" disabled={!!submitting} onClick={() => void run('revision')}>Request revision</Button>
              <Button variant="destructive" disabled={!!submitting} onClick={() => void run('reject')}>Reject</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
