import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, PenLine, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { ImageUpload } from '@/components/uploads/ImageUpload';
import { apiMessage } from '@/lib/api';
import { isValidOptionalUrl, readingTime, stripHtml, wordCount } from '@/lib/blog-content';
import { blogService, taxonomyService } from '@/services/blog.service';
import type { Blog, BlogCategory, BlogFormPayload, BlogTag } from '@/types/blog';

const editableStatuses = ['DRAFT', 'REVISION_REQUESTED'];

const emptyForm: BlogFormPayload = {
  title: '',
  excerpt: '',
  content: '',
  coverImage: '',
  coverImagePublicId: '',
  seoTitle: '',
  seoDescription: '',
  categoryId: '',
  tagIds: [],
};

export default function BlogFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<BlogFormPayload>(emptyForm);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [preview, setPreview] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    Promise.all([
      taxonomyService.categories().catch(() => []),
      taxonomyService.tags().catch(() => []),
    ]).then(([nextCategories, nextTags]) => {
      setCategories(nextCategories);
      setTags(nextTags);
    });
  }, []);

  useEffect(() => {
    if (!id) return;
    blogService.getMine(id)
      .then((data) => {
        setBlog(data);
        setForm(formFromBlog(data));
        setDirty(false);
        if (!editableStatuses.includes(data.status)) {
          toast.error('This blog cannot be edited after submission.');
          navigate(`/my-blogs/${data.id}`, { replace: true });
        }
      })
      .catch((error) => {
        toast.error(apiMessage(error, 'Could not load this blog.'));
        navigate('/my-blogs', { replace: true });
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty || submitting) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty, submitting]);

  const selectedTags = useMemo(() => tags.filter((tag) => form.tagIds?.includes(tag.id)), [form.tagIds, tags]);

  function update(next: Partial<BlogFormPayload>) {
    setForm((current) => ({ ...current, ...next }));
    setDirty(true);
  }

  function toggleTag(id: string) {
    const current = form.tagIds ?? [];
    if (current.includes(id)) {
      update({ tagIds: current.filter((tagId) => tagId !== id) });
      return;
    }
    if (current.length >= 5) {
      toast.error('You can select up to 5 tags.');
      return;
    }
    update({ tagIds: [...current, id] });
  }

  function validate() {
    if (!form.title.trim()) return 'Title is required.';
    if (!stripHtml(form.content).trim()) return 'Content is required.';
    if (uploadingCover) return 'Wait for the cover image upload to finish.';
    if ((form.tagIds?.length ?? 0) > 5) return 'Select up to 5 tags.';
    if ((form.seoTitle?.length ?? 0) > 70) return 'SEO title must be 70 characters or less.';
    if ((form.seoDescription?.length ?? 0) > 160) return 'SEO description must be 160 characters or less.';
    if (!isValidOptionalUrl(form.coverImage)) return 'Cover image must be a valid http or https URL.';
    return '';
  }

  async function save(submitForReview: boolean) {
    const validationError = validate();
    if (validationError) return toast.error(validationError);
    if (id && blog && !editableStatuses.includes(blog.status)) return toast.error('This blog cannot be edited after submission.');
    setSubmitting(true);
    try {
      const payload = buildPayload(form);
      const saved = id ? await blogService.updateMine(id, payload) : await blogService.createDraft(payload);
      setDirty(false);
      if (submitForReview) {
        await blogService.submit(saved.id);
        toast.success('Submitted for review.');
        navigate(`/my-blogs/${saved.id}`);
      } else {
        toast.success('Draft saved.');
        navigate(id ? `/my-blogs/${saved.id}` : '/my-blogs');
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

  if (loading) return <div className="h-64 animate-pulse rounded-2xl border border-[#ded3c4] bg-[#fbf7ef]" />;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-[#231b17]">{id ? 'Edit blog' : 'Write blog'}</h2>
          <p className="text-sm text-[#74685f]">Save a draft or submit it to the editorial queue.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {dirty && <span className="text-xs font-semibold text-[#a9793d]">Unsaved changes</span>}
          <Button type="button" variant="outline" onClick={() => setPreview((value) => !value)}>
            {preview ? <PenLine className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {preview ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {blog && !editableStatuses.includes(blog.status) && <div className="mb-4 rounded-xl bg-yellow-50 p-3 text-sm text-yellow-800">This blog is locked while it is in editorial review.</div>}
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input value={form.title} onChange={(e) => update({ title: e.target.value })} placeholder="Title" maxLength={160} />
            <Input value={form.excerpt} onChange={(e) => update({ excerpt: e.target.value })} placeholder="Excerpt" maxLength={280} />
            <Select value={form.categoryId ?? ''} onChange={(e) => update({ categoryId: e.target.value })}>
              <option value="">No category</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </Select>
            <Input value={form.seoTitle ?? ''} onChange={(e) => update({ seoTitle: e.target.value })} placeholder="SEO title (max 70)" maxLength={70} />
            <Input value={form.seoDescription ?? ''} onChange={(e) => update({ seoDescription: e.target.value })} placeholder="SEO description (max 160)" maxLength={160} />
          </div>
          <div className="space-y-3 rounded-xl border border-[#ded3c4] bg-[#f4efe6] p-4">
            <ImageUpload
              type="BLOG_COVER"
              label="Cover image"
              value={form.coverImage}
              publicId={form.coverImagePublicId}
              disabled={submitting}
              onUploadingChange={setUploadingCover}
              onChange={(image) => update({ coverImage: image?.url ?? '', coverImagePublicId: image?.publicId ?? '' })}
            />
            <details className="text-sm text-[#74685f]">
              <summary className="cursor-pointer font-semibold text-[#5c4b3d]">Advanced: paste image URL</summary>
              <Input className="mt-2" value={form.coverImage ?? ''} onChange={(e) => update({ coverImage: e.target.value, coverImagePublicId: '' })} placeholder="https://example.com/cover.webp" />
            </details>
          </div>
          {tags.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[#5c4b3d]">Tags</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const active = form.tagIds?.includes(tag.id);
                  return (
                    <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)} className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${active ? 'border-[#7b2d32] bg-[#7b2d32] text-[#fffaf1]' : 'border-[#ded3c4] bg-[#fbf7ef] text-[#74685f] hover:border-[#c2a16b]'}`}>
                      {tag.name}
                    </button>
                  );
                })}
              </div>
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => <span key={tag.id} className="inline-flex items-center gap-1 rounded-full bg-[#eee6da] px-2.5 py-1 text-xs font-semibold text-[#7b2d32]">{tag.name}<button type="button" onClick={() => toggleTag(tag.id)} aria-label={`Remove ${tag.name}`}><X className="h-3 w-3" /></button></span>)}
                </div>
              )}
            </div>
          )}
          {preview ? (
            <article className="prose-read min-h-[340px] rounded-xl border border-[#ded3c4] bg-[#fffaf1] p-5" dangerouslySetInnerHTML={{ __html: form.content || '<p></p>' }} />
          ) : (
            <RichTextEditor value={form.content} onChange={(content) => update({ content })} />
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-medium text-[#74685f]">{wordCount(form.content)} words · {readingTime(form.content)}</div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={submitting || uploadingCover}>{submitting ? 'Saving...' : 'Save draft'}</Button>
              <Button type="button" variant="outline" disabled={submitting || uploadingCover} onClick={() => void save(true)}>{submitting ? 'Submitting...' : 'Submit for review'}</Button>
              {id && <Button asChild type="button" variant="ghost"><Link to={`/my-blogs/${id}`}>Cancel</Link></Button>}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function formFromBlog(blog: Blog): BlogFormPayload {
  return {
    title: blog.title,
    excerpt: blog.excerpt ?? '',
    content: blog.content ?? '',
    coverImage: blog.coverImage ?? '',
    coverImagePublicId: blog.coverImagePublicId ?? '',
    seoTitle: blog.seoTitle ?? '',
    seoDescription: blog.seoDescription ?? '',
    categoryId: blog.categoryId ?? (typeof blog.category === 'object' && blog.category ? blog.category.id : ''),
    tagIds: (blog.tags ?? []).map((tag) => (typeof tag === 'string' ? '' : tag.id)).filter(Boolean),
  };
}

function buildPayload(form: BlogFormPayload): BlogFormPayload {
  const tagIds = form.tagIds ?? [];
  return {
    title: form.title.trim(),
    excerpt: form.excerpt?.trim(),
    content: form.content,
    coverImage: form.coverImage?.trim() || null,
    coverImagePublicId: form.coverImagePublicId?.trim() || null,
    seoTitle: form.seoTitle?.trim(),
    seoDescription: form.seoDescription?.trim(),
    categoryId: form.categoryId || null,
    tagIds,
  };
}
