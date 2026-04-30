import type { HTMLAttributes, Ref } from "react"
import { tv, type VariantProps } from "tailwind-variants"
import { cn } from "../cn/cn"

const spinner = tv({
  base: "inline-block animate-spin rounded-full border-2 border-current border-t-transparent",
  variants: {
    size: {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

export type SpinnerVariants = VariantProps<typeof spinner>

export type SpinnerProps = HTMLAttributes<HTMLSpanElement> &
  SpinnerVariants & {
    ref?: Ref<HTMLSpanElement>
    label?: string
  }

export const Spinner = ({
  className,
  size,
  label = "Loading",
  ref,
  ...props
}: SpinnerProps) => (
  <span
    aria-label={label}
    className={cn("text-accent", className)}
    ref={ref}
    role="status"
    {...props}
  >
    <span aria-hidden="true" className={spinner({ size })} />
    <span className="sr-only">{label}</span>
  </span>
)
