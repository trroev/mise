import { cn } from "@mise/ui/utils/cn"
import { type BadgeVariants, badge } from "./badge.variants"

export type BadgeProps = React.ComponentProps<"span"> & BadgeVariants

export const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <span className={cn(badge({ variant }), className)} {...props} />
)
