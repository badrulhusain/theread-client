import { api, unwrapData, unwrapList } from '@/lib/api';
import { normalizeBlog } from '@/lib/blog-status';
import { categoryService } from '@/services/category.service';
import { tagService } from '@/services/tag.service';
import type { QueryParams } from '@/types/api';
import type { Blog, BlogCategory, BlogFormPayload, BlogTag, DashboardSummary } from '@/types/blog';

function normalizeSummary(payload: DashboardSummary) {
  return {
    stats: (payload.stats ?? payload) as NonNullable<DashboardSummary['stats']>,
    recentItems: (payload.recentBlogs ?? payload.recentItems ?? payload.items ?? payload.blogs ?? []).map(normalizeBlog),
  };
}

export const blogService = {
  async getPublishedBlogs(params: QueryParams) {
    return this.listPublished(params);
  },

  async listPublished(params: QueryParams) {
    const { data } = await api.get('/blogs', { params: { limit: 10, ...params } });
    const result = unwrapList<Blog>(data);
    return { ...result, items: result.items.map(normalizeBlog) };
  },

  async getPublishedBySlug(slug: string) {
    const { data } = await api.get<Blog>(`/blogs/${slug}`);
    return normalizeBlog(unwrapData<Blog>(data));
  },

  async getBlogBySlug(slug: string) {
    return this.getPublishedBySlug(slug);
  },

  async getDashboardStats() {
    const { data } = await api.get('/blogs/me/stats');
    return unwrapData(data);
  },

  async userDashboard() {
    const { data } = await api.get('/dashboard/user');
    return normalizeSummary(unwrapData<DashboardSummary>(data));
  },

  async listMine(params: QueryParams = {}) {
    const { data } = await api.get('/blogs/me', { params: { limit: 10, ...params } });
    const result = unwrapList<Blog>(data);
    return { ...result, items: result.items.map(normalizeBlog) };
  },

  async getMine(id: string) {
    const { data } = await api.get<Blog>(`/blogs/me/${id}`);
    return normalizeBlog(unwrapData<Blog>(data));
  },

  async createDraft(payload: BlogFormPayload) {
    const { data } = await api.post<Blog>('/blogs', payload);
    return normalizeBlog(unwrapData<Blog>(data));
  },

  async createBlog(payload: BlogFormPayload) {
    return this.createDraft(payload);
  },

  async updateMine(id: string, payload: BlogFormPayload) {
    const { data } = await api.patch<Blog>(`/blogs/${id}`, payload);
    return normalizeBlog(unwrapData<Blog>(data));
  },

  async updateBlog(id: string, payload: BlogFormPayload) {
    return this.updateMine(id, payload);
  },

  async submit(id: string) {
    const { data } = await api.post<Blog>(`/blogs/${id}/submit`);
    return normalizeBlog(unwrapData<Blog>(data));
  },
};

export const taxonomyService = {
  async categories() {
    return categoryService.getCategories();
  },

  async tags() {
    return tagService.getTags();
  },

  async createCategory(payload: Pick<BlogCategory, 'name' | 'description'>) {
    return categoryService.createCategory(payload);
  },

  async updateCategory(id: string, payload: Pick<BlogCategory, 'name' | 'description' | 'isActive'>) {
    return categoryService.updateCategory(id, payload);
  },

  async deleteCategory(id: string) {
    await categoryService.deleteCategory(id);
  },

  async createTag(payload: Pick<BlogTag, 'name'>) {
    return tagService.createTag(payload);
  },

  async updateTag(id: string, payload: Pick<BlogTag, 'name' | 'isActive'>) {
    return tagService.updateTag(id, payload);
  },

  async deleteTag(id: string) {
    await tagService.deleteTag(id);
  },
};
