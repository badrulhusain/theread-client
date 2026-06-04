import { api, unwrapList } from '@/lib/api';
import type { QueryParams } from '@/types/api';
import type { Blog } from '@/types/blog';
import type { RegisterPayload } from '@/types/auth';
import type { User } from '@/types/user';

export const adminService = {
  async stats() {
    const { data } = await api.get('/admin/stats');
    return data;
  },

  async users(params: QueryParams = {}) {
    const { data } = await api.get('/admin/users', { params: { limit: 10, ...params } });
    return unwrapList<User>(data);
  },

  async promoteToAuthor(id: string) {
    const { data } = await api.patch<User>(`/admin/users/${id}/role`, { role: 'AUTHOR' });
    return data;
  },

  async blockUser(id: string) {
    const { data } = await api.patch<User>(`/admin/users/${id}/block`);
    return data;
  },

  async unblockUser(id: string) {
    const { data } = await api.patch<User>(`/admin/users/${id}/unblock`);
    return data;
  },

  async createEditor(payload: RegisterPayload) {
    const { data } = await api.post<User>('/admin/editors', payload);
    return data;
  },

  async createAdmin(payload: RegisterPayload) {
    const { data } = await api.post<User>('/admin/admins', payload);
    return data;
  },

  async blogs(params: QueryParams = {}) {
    const { data } = await api.get('/admin/blogs', { params: { limit: 10, ...params } });
    return unwrapList<Blog>(data);
  },

  async publishBlog(id: string) {
    const { data } = await api.post<Blog>(`/admin/blogs/${id}/publish`);
    return data;
  },

  async unpublishBlog(id: string) {
    const { data } = await api.post<Blog>(`/admin/blogs/${id}/unpublish`);
    return data;
  },
};
