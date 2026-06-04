import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import type { BlogStatus } from '@/types/blog';

const statusClasses: Record<BlogStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  REVISION_REQUESTED: 'bg-orange-100 text-orange-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  UNPUBLISHED: 'bg-slate-200 text-slate-700',
  ARCHIVED: 'bg-zinc-800 text-white',
};

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', className)} {...props} />;
}

export function StatusBadge({ status }: { status: BlogStatus }) {
  return <Badge className={statusClasses[status] ?? 'bg-slate-100 text-slate-700'}>{status.replaceAll('_', ' ')}</Badge>;
}
