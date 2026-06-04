import axios from 'axios';
import type { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import type { ApiErrorBody, PaginatedResponse } from '@/types/api';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const TOKEN_STORAGE_KEY = 'the_read_access_token';

export const api = axios.create({
  baseURL,
  timeout: 15000,
});

export const getAccessToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);

export const setAccessToken = (token: string) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const clearAccessToken = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.status === 401) {
      clearAccessToken();
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  },
);

export function apiMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  const axiosError = error as AxiosError<ApiErrorBody>;
  const message = axiosError.response?.data?.message;
  if (Array.isArray(message)) return message.join(', ');
  return message || axiosError.response?.data?.error || axiosError.message || fallback;
}

export function showApiError(error: unknown, fallback?: string) {
  toast.error(apiMessage(error, fallback));
}

export function unwrapList<T>(payload: T[] | PaginatedResponse<T>) {
  if (Array.isArray(payload)) {
    return { items: payload, total: payload.length, totalPages: 1 };
  }
  return {
    items: payload.data ?? [],
    total: payload.meta?.total ?? payload.total ?? payload.data?.length ?? 0,
    totalPages: payload.meta?.totalPages ?? payload.totalPages ?? 1,
  };
}
