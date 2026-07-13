import type { Blog, BlogStatus } from '@/types/blog';

const statusMap: Record<string, BlogStatus> = {
  DRAFT: 'DRAFT',
  EDITING: 'EDITING',
  SUBMITTED: 'QUALITY_REVIEW',
  UNDERREVIEW: 'QUALITY_REVIEW',
  UNDER_REVIEW: 'QUALITY_REVIEW',
  QUALITYREVIEW: 'QUALITY_REVIEW',
  QUALITY_REVIEW: 'QUALITY_REVIEW',
  REVISIONREQUESTED: 'NEEDS_CORRECTION',
  REVISION_REQUESTED: 'NEEDS_CORRECTION',
  NEEDSCORRECTION: 'NEEDS_CORRECTION',
  NEEDS_CORRECTION: 'NEEDS_CORRECTION',
  APPROVED: 'READY_FOR_ADMIN',
  READYFORADMIN: 'READY_FOR_ADMIN',
  READY_FOR_ADMIN: 'READY_FOR_ADMIN',
  SCHEDULED: 'SCHEDULED',
  REJECTED: 'REJECTED',
  REJECT: 'REJECTED',
  PUBLISHED: 'PUBLISHED',
  PUBLIC: 'PUBLISHED',
  UNPUBLISHED: 'UNPUBLISHED',
  ARCHIVED: 'ARCHIVED',
};

export function normalizeBlogStatus(status: unknown): BlogStatus {
  const key = String(status || 'DRAFT')
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toUpperCase();
  return statusMap[key] ?? statusMap[key.replaceAll('_', '')] ?? 'DRAFT';
}

export function normalizeBlog<T extends Blog>(blog: T): T {
  return {
    ...blog,
    status: normalizeBlogStatus(blog.status),
  };
}

export function normalizeBlogs<T extends Blog>(blogs: T[]) {
  return blogs.map(normalizeBlog);
}
