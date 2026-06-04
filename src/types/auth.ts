export type UserRole = 'USER' | 'AUTHOR' | 'EDITOR' | 'ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isBlocked?: boolean;
  status?: 'ACTIVE' | 'BLOCKED' | string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken?: string;
  access_token?: string;
  token?: string;
}
