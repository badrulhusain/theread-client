import { api, unwrapList } from '@/lib/api';
import type { QueryParams } from '@/types/api';
import type { Blog, BlogFormPayload } from '@/types/blog';

export const blogService = {
  async listPublished(params: QueryParams) {
    const { data } = await api.get('/blogs', { params: { limit: 10, ...params } });
    return unwrapList<Blog>(data);
  },

  async getPublishedBySlug(slug: string) {
    const { data } = await api.get<Blog>(`/blogs/${slug}`);
    return data;
  },

  async getDashboardStats() {
    const { data } = await api.get('/blogs/me/stats');
    return data;
  },

  async listMine(params: QueryParams = {}) {
    const { data } = await api.get('/blogs/me', { params: { limit: 10, ...params } });
    return unwrapList<Blog>(data);
  },

  async getMine(id: string) {
    const { data } = await api.get<Blog>(`/blogs/me/${id}`);
    return data;
  },

  async createDraft(payload: BlogFormPayload) {
    const { data } = await api.post<Blog>('/blogs', payload);
    return data;
  },

  async updateMine(id: string, payload: BlogFormPayload) {
    const { data } = await api.patch<Blog>(`/blogs/${id}`, payload);
    return data;
  },

  async submit(id: string) {
    const { data } = await api.post<Blog>(`/blogs/${id}/submit`);
    return data;
  },
};
