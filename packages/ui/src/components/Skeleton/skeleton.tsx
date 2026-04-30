import { type SkeletonVariants, skeleton } from "./skeleton.variants"

export type SkeletonProps = React.ComponentProps<"span"> & SkeletonVariants

export const Skeleton = ({ className, variant, ...props }: SkeletonProps) => (
  <span
    aria-busy="true"
    aria-live="polite"
    className={skeleton({ variant, className })}
    {...props}
  />
)
