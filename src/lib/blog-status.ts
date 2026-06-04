import type { Blog, BlogStatus } from '@/types/blog';

const statusMap: Record<string, BlogStatus> = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  UNDERREVIEW: 'UNDER_REVIEW',
  UNDER_REVIEW: 'UNDER_REVIEW',
  INREVIEW: 'UNDER_REVIEW',
  IN_REVIEW: 'UNDER_REVIEW',
  REVIEW: 'UNDER_REVIEW',
  REVISIONREQUESTED: 'REVISION_REQUESTED',
  REVISION_REQUESTED: 'REVISION_REQUESTED',
  CHANGESREQUESTED: 'REVISION_REQUESTED',
  CHANGES_REQUESTED: 'REVISION_REQUESTED',
  APPROVED: 'APPROVED',
  APPROVE: 'APPROVED',
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
