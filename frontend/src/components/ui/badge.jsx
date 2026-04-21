/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-primary/10 bg-primary/10 text-primary hover:bg-primary/15",
        secondary:
          "border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200/80",
        success:
          "border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-400",
        destructive:
          "border-red-200 bg-red-50 text-red-600 hover:bg-red-100",
        outline: "border-gray-200 bg-white text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
