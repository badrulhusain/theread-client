import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-[#5c4b3d]/10 bg-[#eef0e9] px-3 py-1 text-base text-[#231b17] shadow-[inset_6px_6px_12px_rgba(97,85,68,0.15),inset_-6px_-6px_12px_rgba(255,255,250,0.88)] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#231b17] placeholder:text-[#a19184] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b2d32]/25 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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
