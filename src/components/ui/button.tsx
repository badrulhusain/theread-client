import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b2d32]/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#7b2d32] text-[#fffaf1] shadow-[0_10px_24px_rgba(92,31,37,0.22)] hover:bg-[#5c1f25]",
        destructive:
          "bg-[#8c2f2f] text-[#fffaf1] shadow-sm hover:bg-[#6f2424]",
        outline:
          "border border-[#ded3c4] bg-[#fbf7ef] text-[#231b17] shadow-[3px_3px_10px_rgba(98,69,39,0.12),-3px_-3px_10px_rgba(255,252,243,0.8)] hover:border-[#c2a16b] hover:bg-[#f4efe6]",
        secondary:
          "bg-[#eee6da] text-[#5c1f25] shadow-sm hover:bg-[#e5d8c8]",
        ghost: "text-[#5c4b3d] hover:bg-[#eee6da] hover:text-[#7b2d32]",
        link: "text-[#7b2d32] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-7",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
