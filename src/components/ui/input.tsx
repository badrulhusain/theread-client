import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-[#ded3c4] bg-[#fbf7ef]/80 px-3 py-1 text-base text-[#231b17] shadow-[inset_3px_3px_8px_rgba(98,69,39,0.09),inset_-3px_-3px_8px_rgba(255,252,243,0.85)] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#231b17] placeholder:text-[#a19184] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b2d32]/25 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
