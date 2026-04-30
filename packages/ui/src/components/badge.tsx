import type { HTMLAttributes, Ref } from "react"
import { tv, type VariantProps } from "tailwind-variants"

const badge = tv({
  base: "inline-flex items-center rounded-sm px-2 py-0.5 font-sans text-caption uppercase tracking-widest",
  variants: {
    variant: {
      default: "bg-accent text-accent-foreground",
      muted: "border border-border bg-surface text-text-secondary",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export type BadgeVariants = VariantProps<typeof badge>

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  BadgeVariants & {
    ref?: Ref<HTMLSpanElement>
  }

export const Badge = ({ className, variant, ref, ...props }: BadgeProps) => (
  <span className={badge({ variant, className })} ref={ref} {...props} />
)
