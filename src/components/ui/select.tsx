import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, children, ...rest } = props;
  return (
    <select
      className={cn('h-10 w-full rounded-xl border border-[#5c4b3d]/10 bg-[#eef0e9] px-3 text-sm text-[#231b17] shadow-[inset_6px_6px_12px_rgba(97,85,68,0.15),inset_-6px_-6px_12px_rgba(255,255,250,0.88)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b2d32]/25', className)}
      {...rest}
    >
      {children}
    </select>
  );
}
