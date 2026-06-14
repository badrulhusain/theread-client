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

export interface BlogAuthor {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string | null;
}

export interface Blog {
  id: string;
  slug?: string;
  title: string;
  excerpt?: string;
  content?: string;
  coverImage?: string | BlogCoverImage | null;
  coverImagePublicId?: string | null;
  imageUrl?: string | null;
  altText?: string | null;
  coverImageAltText?: string | null;
  crop?: BlogImageCrop | null;
  coverImageCrop?: BlogImageCrop | null;
  seoTitle?: string;
  seoDescription?: string;
  category?: BlogCategory | string | null;
  categoryId?: string | null;
  tags?: Array<BlogTag | string>;
  commentsCount?: number;
  status: BlogStatus;
  author?: BlogAuthor;
  editor?: Pick<AuthUser, 'id' | 'name' | 'email'> | null;
  editorId?: string | null;
  assignedEditorId?: string | null;
  reviewerId?: string | null;
  assignedToId?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  reviewComments?: ReviewComment[];
}

export interface BlogImageCrop {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
}

export interface BlogCoverImage {
  url: string;
  publicId?: string | null;
  altText?: string | null;
  crop?: BlogImageCrop | null;
}

export interface BlogFormPayload {
  title: string;
  excerpt?: string;
  content: string;
  coverImage?: BlogCoverImage | null;
  seoTitle?: string;
  seoDescription?: string;
  categoryId?: string | null;
  tags?: string[];
  tagIds?: string[];
}

export interface BlogStats {
  totalSubmitted?: number;
  draftCount?: number;
  drafts?: number;
  submittedCount?: number;
  submitted?: number;
  underReviewCount?: number;
  underReview?: number;
  revisionRequestedCount?: number;
  revisionRequested?: number;
  approvedCount?: number;
  publishedCount?: number;
  published?: number;
  rejectedCount?: number;
  rejected?: number;
  submittedBlogs?: number;
  submittedQueue?: number;
  underReviewByMe?: number;
  assignedToMe?: number;
  approved?: number;
  approvedByMe?: number;
  rejectedByMe?: number;
  revisionRequestedByMe?: number;
  rejectedOrRevisionRequested?: number;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  blogCount?: number;
  blogsCount?: number;
  count?: number;
}

export interface BlogTag {
  id: string;
  name: string;
  slug?: string;
  isActive?: boolean;
  usageCount?: number;
  blogCount?: number;
  blogsCount?: number;
  count?: number;
}

export interface DashboardSummary {
  stats?: BlogStats & Record<string, number | undefined>;
  recentBlogs?: Blog[];
  recentItems?: Blog[];
  items?: Blog[];
  blogs?: Blog[];
}

export type UploadImageType = 'BLOG_COVER' | 'PROFILE_IMAGE';

export interface UploadImageResponse {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export type CommentStatus = 'VISIBLE' | 'HIDDEN' | 'DELETED' | 'PENDING' | string;

export interface BlogComment {
  id: string;
  content: string;
  status: CommentStatus;
  createdAt: string;
  updatedAt?: string;
  blogId?: string;
  blogTitle?: string;
  blogSlug?: string;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
}
