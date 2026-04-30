import { cn } from "@mise/ui/utils/cn"
import type { HTMLAttributes, Ref } from "react"
import { type SpinnerVariants, spinner } from "./spinner.variants"

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
