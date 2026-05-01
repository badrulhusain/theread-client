import axios from 'axios';
import type { Author, Post, Tag, ContentBlock } from './types';

const BASE = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:3000/api';

export const http = axios.create({ baseURL: BASE });

export const getToken = () => localStorage.getItem('tr_token');
export const setToken = (t: string) => localStorage.setItem('tr_token', t);
export const clearToken = () => localStorage.removeItem('tr_token');

http.interceptors.request.use(cfg => {
  const token = getToken();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ── Helpers ────────────────────────────────────────────────────────────────────
const TAG_HUES: Record<string, string> = {
  Literature: '#7a2e2e',
  Philosophy: '#5a6b3a',
  'Campus Life': '#b08a55',
  Essays: '#6b4a6e',
  Science: '#3a5a6b',
  Politics: '#9a3b3b',
  Poetry: '#a8763a',
  Opinion: '#4a4a2a',
};

function tagHue(name: string): string {
  if (TAG_HUES[name]) return TAG_HUES[name];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return `hsl(${h % 300 + 20}, 38%, 32%)`;
}

const COVER_GRADIENTS = [
  'linear-gradient(135deg, #7a2e2e 0%, #4a1818 60%, #2a0c0c 100%)',
  'linear-gradient(135deg, #5a6b3a 0%, #3d4a26 70%, #1f2a0f 100%)',
  'linear-gradient(135deg, #c9a878 0%, #9a7a48 60%, #6a4a28 100%)',
  'linear-gradient(135deg, #3a5a6b 0%, #1f3a4a 60%, #0f1f28 100%)',
  'linear-gradient(135deg, #6b4a6e 0%, #4a2e50 60%, #2a1530 100%)',
  'linear-gradient(135deg, #9a3b3b 0%, #6a2020 60%, #3a0e0e 100%)',
  'linear-gradient(135deg, #4a5a3a 0%, #2e3a24 60%, #1a2010 100%)',
  'linear-gradient(135deg, #5a4a3a 0%, #3a2a20 60%, #1e1510 100%)',
];

const COVER_ACCENTS = ['📖', '◆', '☁', '∴', '♪', '★', '✦', '⌘', '∞', '◉', '⬟', '◈'];

function idHash(id: string): number {
  return id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
}

function coverFor(id: string): string {
  return COVER_GRADIENTS[idHash(id) % COVER_GRADIENTS.length];
}

function accentFor(id: string): string {
  return COVER_ACCENTS[idHash(id) % COVER_ACCENTS.length];
}

function initialsFrom(name: string): string {
  const parts = (name ?? '').trim().split(/\s+/);
  if (parts.length === 1) return (parts[0][0] ?? '?').toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function roleMap(r: string): 'ADMIN' | 'AUTHOR' | 'USER' {
  if (r === 'ADMIN') return 'ADMIN';
  if (r === 'AUTHOR') return 'AUTHOR';
  return 'USER';
}

function contentFrom(raw: string): ContentBlock[] {
  if (!raw) return [];
  return raw
    .split(/\n\n+/)
    .filter(Boolean)
    .map(p => {
      if (p.startsWith('## ')) return { type: 'h2' as const, text: p.slice(3).trim() };
      if (p.startsWith('> ')) return { type: 'pull' as const, text: p.slice(2).trim() };
      return { type: 'p' as const, text: p.trim() };
    });
}

function readTimeFrom(content: string): number {
  const words = (content ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

// ── Mappers ────────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapUser(u: any): Author {
  const name = u.name ?? u.email?.split('@')[0] ?? 'Unknown';
  return {
    id: u.id,
    name,
    initials: initialsFrom(name),
    role: roleMap(u.role),
    dept: u.department ?? '',
    year: u.role === 'ADMIN' ? 'Admin' : u.role === 'AUTHOR' ? 'Contributor' : 'Reader',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapTag(t: any): Tag {
  const name = t.name ?? '';
  return { id: t.id, name, hue: tagHue(name) };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapPost(p: any): Post {
  const rawTags: Tag[] = (p.tags ?? []).map((pt: any) => mapTag(pt.tag ?? pt));
  const cover = p.coverImage && p.coverImage.startsWith('linear-gradient')
    ? p.coverImage
    : (p.coverImage ? `url(${p.coverImage})` : coverFor(p.id));
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt ?? '',
    cover,
    coverAccent: accentFor(p.id),
    author: mapUser(p.author),
    createdAt: p.publishedAt ?? p.createdAt ?? new Date().toISOString(),
    readTime: readTimeFrom(p.content ?? ''),
    tags: rawTags,
    views: p.viewCount ?? 0,
    comments: p._count?.comments ?? (Array.isArray(p.comments) ? p.comments.length : 0),
    reactions: 0,
    featured: p.featured ?? p.status === 'PUBLISHED',
    content: contentFrom(p.content ?? ''),
  };
}

// ── Auth ───────────────────────────────────────────────────────────────────────
export const auth = {
  login: async (email: string, password: string): Promise<Author> => {
    const { data } = await http.post('/auth/login', { email, password });
    setToken(data.access_token);
    return mapUser(data.user);
  },
  register: async (name: string, email: string, password: string): Promise<Author> => {
    const { data } = await http.post('/auth/register', { name, email, password });
    setToken(data.access_token);
    return mapUser(data.user);
  },
  me: async (): Promise<Author> => {
    const { data } = await http.get('/auth/me');
    return mapUser(data);
  },
  logout: clearToken,
};

// ── Posts ──────────────────────────────────────────────────────────────────────
export const postsApi = {
  list: async (params?: { page?: number; limit?: number; status?: string; tag?: string }): Promise<Post[]> => {
    const { data } = await http.get('/posts', { params: { limit: 20, ...params } });
    const items = Array.isArray(data) ? data : (data.data ?? []);
    return items.map(mapPost);
  },
  get: async (id: string): Promise<Post> => {
    const { data } = await http.get(`/posts/${id}`);
    return mapPost(data);
  },
  getBySlug: async (slug: string): Promise<Post> => {
    const { data } = await http.get(`/posts/slug/${slug}`);
    return mapPost(data);
  },
  create: async (payload: {
    title: string;
    content: string;
    excerpt?: string;
    tagIds?: string[];
    status?: 'DRAFT' | 'PUBLISHED';
  }): Promise<Post> => {
    const { data } = await http.post('/posts', payload);
    return mapPost(data);
  },
};

// ── Tags ───────────────────────────────────────────────────────────────────────
export const tagsApi = {
  list: async (): Promise<Tag[]> => {
    const { data } = await http.get('/tags');
    return (Array.isArray(data) ? data : (data.data ?? [])).map(mapTag);
  },
};

// ── Comments ───────────────────────────────────────────────────────────────────
export interface ApiComment {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string };
  replies?: ApiComment[];
}

export const commentsApi = {
  listForPost: async (postId: string): Promise<ApiComment[]> => {
    const { data } = await http.get(`/comments/post/${postId}`);
    return Array.isArray(data) ? data : (data.data ?? []);
  },
  create: async (postId: string, content: string): Promise<ApiComment> => {
    const { data } = await http.post('/comments', { postId, content });
    return data;
  },
};
