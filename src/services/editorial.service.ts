import { api, unwrapList } from '@/lib/api';
import type { QueryParams } from '@/types/api';
import type { Blog, BlogFormPayload } from '@/types/blog';

export const editorialService = {
  async stats() {
    const { data } = await api.get('/editor/stats');
    return data;
  },

  async submissions(params: QueryParams = {}) {
    const { data } = await api.get('/editor/submissions', { params: { limit: 10, ...params } });
    return unwrapList<Blog>(data);
  },

  async getBlog(id: string) {
    const { data } = await api.get<Blog>(`/editor/blogs/${id}`);
    return data;
  },

  async pick(id: string) {
    const { data } = await api.post<Blog>(`/editor/blogs/${id}/pick`);
    return data;
  },

  async update(id: string, payload: BlogFormPayload) {
    const { data } = await api.patch<Blog>(`/editor/blogs/${id}`, payload);
    return data;
  },

  async approve(id: string, comment?: string) {
    const { data } = await api.post<Blog>(`/editor/blogs/${id}/approve`, { comment });
    return data;
  },

  async reject(id: string, comment: string) {
    const { data } = await api.post<Blog>(`/editor/blogs/${id}/reject`, { comment });
    return data;
  },

  async requestRevision(id: string, comment: string) {
    const { data } = await api.post<Blog>(`/editor/blogs/${id}/request-revision`, { comment });
    return data;
  },
};
