import type { HTMLAttributes, Ref } from "react"
import { type BadgeVariants, badge } from "./badge.variants"

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  BadgeVariants & {
    ref?: Ref<HTMLSpanElement>
  }

export const Badge = ({ className, variant, ref, ...props }: BadgeProps) => (
  <span className={badge({ variant, className })} ref={ref} {...props} />
)
