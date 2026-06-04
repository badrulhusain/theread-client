import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiMessage } from '@/lib/api';
import { editorialService } from '@/services/editorial.service';
import type { BlogFormPayload } from '@/types/blog';

export default function EditorEditBlogPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<BlogFormPayload>({ title: '', excerpt: '', content: '', coverImage: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    editorialService.getBlog(id)
      .then((blog) => setForm({ title: blog.title, excerpt: blog.excerpt ?? '', content: blog.content ?? '', coverImage: blog.coverImage ?? '' }))
      .catch((error) => toast.error(apiMessage(error, 'Could not load blog.')))
      .finally(() => setLoading(false));
  }, [id]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await editorialService.update(id, { ...form, coverImage: form.coverImage || null });
      toast.success('Blog saved.');
      navigate(`/editor/blogs/${id}/review`);
    } catch (error) {
      toast.error(apiMessage(error, 'Could not save blog.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-slate-500">Loading editor...</p>;

  return (
    <Card>
      <CardHeader><h2 className="text-2xl font-semibold">Edit assigned blog</h2></CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          <Input value={form.coverImage ?? ''} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="Cover image URL" />
          <Textarea className="min-h-[360px]" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          <Button disabled={submitting}>{submitting ? 'Saving...' : 'Save changes'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
