import { api, unwrapData, unwrapList } from '@/lib/api';
import { normalizeBlog, normalizeBlogStatus } from '@/lib/blog-status';
import type { QueryParams } from '@/types/api';
import type {
  Blog,
  BlogCoverImage,
  BlogFormPayload,
  DashboardSummary,
  EditorialEvaluation,
} from '@/types/blog';
import type { AuthUser } from '@/types/auth';

export function isAssignedToEditor(blog: Blog | null | undefined, user: AuthUser | null | undefined) {
  if (!blog || !user) return false;
  if (user.role === 'ADMIN') return true;
  return [
    blog.editorId,
    blog.editor?.id,
    blog.assignedEditorId,
    blog.reviewerId,
    blog.assignedToId,
  ].includes(user.id);
}

export const editorialService = {
  async dashboard() {
    const { data } = await api.get('/dashboard/editor');
    const summary = unwrapData<DashboardSummary>(data);
    return {
      stats: (summary.stats ?? summary) as NonNullable<DashboardSummary['stats']>,
      recentItems: (summary.recentBlogs ?? summary.recentItems ?? summary.items ?? summary.blogs ?? []).map(normalizeBlog),
    };
  },

  async stats() {
    const { data } = await api.get('/editorial/stats');
    return unwrapData(data);
  },

  async submissions(params: QueryParams = {}) {
    const { data } = await api.get('/editorial/submissions', { params: { limit: 10, ...params } });
    const result = unwrapList<Blog>(data);
    return { ...result, items: result.items.map(normalizeBlog) };
  },

  async activeReviews(params: QueryParams = {}) {
    const reviewParams = { limit: 10, status: 'QUALITY_REVIEW', ...params };
    const paths = ['/editorial/blogs', '/editorial/my-reviews', '/editorial/reviews', '/editorial/submissions'];
    let lastError: unknown;

    for (const path of paths) {
      try {
        const { data } = await api.get(path, { params: reviewParams });
        const result = unwrapList<Blog>(data);
        return { ...result, items: result.items.map(normalizeBlog).filter((blog) => normalizeBlogStatus(blog.status) === 'QUALITY_REVIEW') };
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  },

  async getBlog(id: string) {
    const { data } = await api.get<Blog>(`/editorial/blogs/${id}`);
    return normalizeBlog(unwrapData<Blog>(data));
  },

  async createDraft(payload: BlogFormPayload) {
    const { data } = await api.post<Blog>('/editorial/articles', payload);
    return normalizeBlog(unwrapData<Blog>(data));
  },

  async autosave(id: string, payload: Partial<BlogFormPayload>) {
    const { data } = await api.patch<Blog>(`/editorial/articles/${id}/autosave`, payload);
    return normalizeBlog(unwrapData<Blog>(data));
  },

  async myWork(params: QueryParams = {}) {
    const { data } = await api.get('/editorial/articles/my-work', { params: { limit: 10, ...params } });
    const result = unwrapList<Blog>(data);
    return { ...result, items: result.items.map(normalizeBlog) };
  },

  async pick(id: string) {
    const { data } = await api.post<Blog>(`/editorial/blogs/${id}/pick`);
    return normalizeBlog(unwrapData<Blog>(data));
  },

  async assign(id: string, editorId: string) { const { data } = await api.post<Blog>(`/editorial/blogs/${id}/assign`, { editorId }); return normalizeBlog(unwrapData<Blog>(data)); },
  async saveReview(id: string, payload: Pick<Blog, 'internalNotes' | 'plagiarismScore' | 'plagiarismReviewed' | 'factCheckComplete' | 'editorialChecklist' | 'recommendation'>) { const { data } = await api.patch<Blog>(`/editorial/blogs/${id}/review`, payload); return normalizeBlog(unwrapData<Blog>(data)); },

  async saveEvaluation(id: string, payload: EditorialEvaluation) {
    const { data } = await api.put<Blog>(`/editorial/articles/${id}/evaluation`, payload);
    return normalizeBlog(unwrapData<Blog>(data));
  },

  async markQualityReviewComplete(id: string) {
    const { data } = await api.post<Blog>(`/editorial/articles/${id}/quality-review/complete`);
    return normalizeBlog(unwrapData<Blog>(data));
  },

  async sendToAdmin(id: string) {
    const { data } = await api.post<Blog>(`/editorial/articles/${id}/send-to-admin`);
    return normalizeBlog(unwrapData<Blog>(data));
  },

  async update(id: string, payload: BlogFormPayload) {
    const { data } = await api.patch<Blog>(`/editorial/blogs/${id}/edit`, payload);
    return normalizeBlog(unwrapData<Blog>(data));
  },

  async updateCoverImage(id: string, coverImage: BlogCoverImage | null) {
    const { data } = await api.patch<Blog>(`/blogs/${id}/cover-image`, { coverImage });
    return normalizeBlog(unwrapData<Blog>(data));
  },

  async approve(id: string, comment?: string) {
    const { data } = await api.post<Blog>(`/editorial/blogs/${id}/approve`, { comment });
    return normalizeBlog(unwrapData<Blog>(data));
  },

  async reject(id: string, comment: string) {
    const { data } = await api.post<Blog>(`/editorial/blogs/${id}/reject`, { comment });
    return normalizeBlog(unwrapData<Blog>(data));
  },

  async requestRevision(id: string, comment: string) {
    const { data } = await api.post<Blog>(`/editorial/blogs/${id}/request-revision`, { comment });
    return normalizeBlog(unwrapData<Blog>(data));
  },

};

export function canEditorWorkOn(blog: Blog | null | undefined, user: AuthUser | null | undefined) {
  if (!blog || !user) return false;
  return ['EDITING', 'QUALITY_REVIEW', 'NEEDS_CORRECTION'].includes(normalizeBlogStatus(blog.status)) && (user.role === 'EDITOR' || user.role === 'ADMIN');
}

export function canManageEditorialBlog(user: AuthUser | null | undefined) {
  return user?.role === 'EDITOR' || user?.role === 'ADMIN';
}
