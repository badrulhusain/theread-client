import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, children, ...rest } = props;
  return (
    <select
      className={cn('h-10 w-full rounded-xl border border-[#ded3c4] bg-[#fbf7ef] px-3 text-sm text-[#231b17] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b2d32]/25', className)}
      {...rest}
    >
      {children}
    </select>
  );
}
