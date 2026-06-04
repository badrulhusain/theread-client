import { api } from '@/lib/api';
import type { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from '@/types/auth';

function normalizeAuthResponse(data: any): AuthResponse {
  return {
    user: data.user ?? data.data?.user ?? data,
    accessToken: data.accessToken ?? data.access_token ?? data.token ?? data.data?.accessToken ?? data.data?.access_token,
  };
}

export const authService = {
  async login(payload: LoginPayload) {
    const { data } = await api.post('/auth/login', payload);
    return normalizeAuthResponse(data);
  },

  async register(payload: RegisterPayload) {
    const { data } = await api.post('/auth/register', payload);
    return normalizeAuthResponse(data);
  },

  async me() {
    const { data } = await api.get<AuthUser | { user: AuthUser }>('/auth/me');
    return ((data as { user?: AuthUser }).user ?? data) as AuthUser;
  },
};
