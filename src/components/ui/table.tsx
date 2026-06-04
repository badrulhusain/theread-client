import type { TableHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-[#ded3c4] bg-[#fbf7ef]">
      <table className={cn('w-full min-w-[680px] text-left text-sm text-[#231b17] [&_td]:border-t [&_td]:border-[#ded3c4] [&_td]:px-4 [&_td]:py-3 [&_th]:bg-[#eee6da] [&_th]:px-4 [&_th]:py-3 [&_th]:font-semibold [&_th]:text-[#5c4b3d]', className)} {...props} />
    </div>
  );
}
