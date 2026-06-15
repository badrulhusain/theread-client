import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'min-h-28 w-full rounded-xl border border-[#5c4b3d]/10 bg-[#eef0e9] px-3 py-2 text-sm leading-6 text-[#231b17] shadow-[inset_6px_6px_12px_rgba(97,85,68,0.15),inset_-6px_-6px_12px_rgba(255,255,250,0.88)] placeholder:text-[#a19184] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b2d32]/25 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

export { Textarea };
