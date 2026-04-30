import { type BadgeVariants, badge } from "./badge.variants"

export type BadgeProps = React.ComponentProps<"span"> & BadgeVariants

export const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <span className={badge({ variant, className })} {...props} />
)
