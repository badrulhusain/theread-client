import type { AuthUser } from './auth';

export type BlogStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'REVISION_REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PUBLISHED'
  | 'UNPUBLISHED'
  | 'ARCHIVED';

export interface ReviewComment {
  id: string;
  comment: string;
  createdAt: string;
  editor?: Pick<AuthUser, 'id' | 'name' | 'email'>;
  type?: 'REJECT' | 'REVISION' | 'APPROVAL' | string;
}

export interface Blog {
  id: string;
  slug?: string;
  title: string;
  excerpt?: string;
  content?: string;
  coverImage?: string | null;
  status: BlogStatus;
  author?: Pick<AuthUser, 'id' | 'name' | 'email'>;
  editor?: Pick<AuthUser, 'id' | 'name' | 'email'> | null;
  editorId?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  reviewComments?: ReviewComment[];
}

export interface BlogFormPayload {
  title: string;
  excerpt?: string;
  content: string;
  coverImage?: string | null;
}

export interface BlogStats {
  totalSubmitted?: number;
  draftCount?: number;
  underReviewCount?: number;
  publishedCount?: number;
  submittedBlogs?: number;
  underReviewByMe?: number;
  approved?: number;
  rejectedOrRevisionRequested?: number;
}
