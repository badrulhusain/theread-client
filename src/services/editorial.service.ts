import { api, unwrapData, unwrapList } from '@/lib/api';
import { normalizeBlog, normalizeBlogStatus } from '@/lib/blog-status';
import type { QueryParams } from '@/types/api';
import type { Blog, BlogFormPayload, DashboardSummary } from '@/types/blog';
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
    const reviewParams = { limit: 10, status: 'UNDER_REVIEW', ...params };
    const paths = ['/editorial/blogs', '/editorial/my-reviews', '/editorial/reviews', '/editorial/submissions'];
    let lastError: unknown;

    for (const path of paths) {
      try {
        const { data } = await api.get(path, { params: reviewParams });
        const result = unwrapList<Blog>(data);
        return { ...result, items: result.items.map(normalizeBlog).filter((blog) => normalizeBlogStatus(blog.status) === 'UNDER_REVIEW') };
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

  async pick(id: string) {
    const { data } = await api.post<Blog>(`/editorial/blogs/${id}/pick`);
    return normalizeBlog(unwrapData<Blog>(data));
  },

  async update(id: string, payload: BlogFormPayload) {
    const { data } = await api.patch<Blog>(`/editorial/blogs/${id}/edit`, payload);
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
  return normalizeBlogStatus(blog.status) === 'UNDER_REVIEW' && (user.role === 'EDITOR' || user.role === 'ADMIN');
}
