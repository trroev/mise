import { tv, type VariantProps } from "tailwind-variants"

export const spinner = tv({
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
