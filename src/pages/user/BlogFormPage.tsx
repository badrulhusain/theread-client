import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiMessage } from '@/lib/api';
import { blogService } from '@/services/blog.service';
import type { Blog, BlogFormPayload } from '@/types/blog';

const editableStatuses = ['DRAFT', 'REVISION_REQUESTED'];

export default function BlogFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<BlogFormPayload>({ title: '', excerpt: '', content: '', coverImage: '' });
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    blogService.getMine(id)
      .then((data) => {
        setBlog(data);
        setForm({ title: data.title, excerpt: data.excerpt ?? '', content: data.content ?? '', coverImage: data.coverImage ?? '' });
      })
      .catch((error) => toast.error(apiMessage(error, 'Could not load this blog.')))
      .finally(() => setLoading(false));
  }, [id]);

  async function save(submitForReview: boolean) {
    if (form.title.trim().length < 3) return toast.error('Title must be at least 3 characters.');
    if (form.content.trim().length < 50) return toast.error('Content must be at least 50 characters.');
    if (id && blog && !editableStatuses.includes(blog.status)) return toast.error('This blog cannot be edited after submission.');
    setSubmitting(true);
    try {
      const payload = { ...form, title: form.title.trim(), excerpt: form.excerpt?.trim(), coverImage: form.coverImage || null };
      const saved = id ? await blogService.updateMine(id, payload) : await blogService.createDraft(payload);
      if (submitForReview) {
        await blogService.submit(saved.id);
        toast.success('Submitted for review.');
        navigate(`/my-blogs/${saved.id}`);
      } else {
        toast.success('Draft saved.');
        navigate('/my-blogs');
      }
    } catch (error) {
      toast.error(apiMessage(error, 'Could not save this blog.'));
    } finally {
      setSubmitting(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void save(false);
  }

  if (loading) return <p className="text-slate-500">Loading editor...</p>;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-semibold">{id ? 'Edit blog' : 'Write blog'}</h2>
        <p className="text-sm text-slate-500">Save a draft or submit it to the editorial queue.</p>
      </CardHeader>
      <CardContent>
        {blog && !editableStatuses.includes(blog.status) && <div className="mb-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">This blog is locked while it is in editorial review.</div>}
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" maxLength={160} />
          <Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Excerpt" maxLength={280} />
          <Input value={form.coverImage ?? ''} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="Cover image URL (optional)" />
          <Textarea className="min-h-[360px]" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write the full blog content..." />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save draft'}</Button>
            <Button type="button" variant="outline" disabled={submitting} onClick={() => void save(true)}>Submit for review</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
