import type { HTMLAttributes, Ref } from "react"
import { type SkeletonVariants, skeleton } from "./skeleton.variants"

export type SkeletonProps = HTMLAttributes<HTMLSpanElement> &
  SkeletonVariants & {
    ref?: Ref<HTMLSpanElement>
  }

export const Skeleton = ({
  className,
  variant,
  ref,
  ...props
}: SkeletonProps) => (
  <span
    aria-busy="true"
    aria-live="polite"
    className={skeleton({ variant, className })}
    ref={ref}
    {...props}
  />
)
