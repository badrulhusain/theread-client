import type { UserRole } from './auth';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isBlocked?: boolean;
  status?: 'ACTIVE' | 'BLOCKED' | string;
  createdAt?: string;
}

export interface AdminStats {
  totalUsers?: number;
  totalEditors?: number;
  submittedBlogs?: number;
  approvedBlogs?: number;
  publishedBlogs?: number;
}
