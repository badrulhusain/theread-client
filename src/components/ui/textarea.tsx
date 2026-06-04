import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'min-h-28 w-full rounded-xl border border-[#ded3c4] bg-[#fbf7ef]/80 px-3 py-2 text-sm leading-6 text-[#231b17] shadow-[inset_3px_3px_8px_rgba(98,69,39,0.09),inset_-3px_-3px_8px_rgba(255,252,243,0.85)] placeholder:text-[#a19184] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b2d32]/25 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

export { Textarea };
