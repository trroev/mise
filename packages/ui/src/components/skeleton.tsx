import type { HTMLAttributes, Ref } from "react"
import { tv, type VariantProps } from "tailwind-variants"

const skeleton = tv({
  base: "block animate-pulse rounded-sm bg-surface",
  variants: {
    variant: {
      block: "h-24 w-full",
      text: "h-4 w-full last:w-3/4",
    },
  },
  defaultVariants: {
    variant: "block",
  },
})

export type SkeletonVariants = VariantProps<typeof skeleton>

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
