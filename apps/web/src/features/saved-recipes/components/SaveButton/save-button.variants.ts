import { tv, type VariantProps } from "tailwind-variants"

export const saveButton = tv({
  base: "inline-flex size-9 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60",
  variants: {
    variant: {
      default:
        "bg-background/90 text-text-primary shadow-sm backdrop-blur-sm hover:bg-background",
      glass:
        "border border-white/20 bg-black/15 text-white shadow-lg ring-1 ring-black/5 backdrop-blur-md backdrop-saturate-150 hover:bg-black/45",
    },
    isSaved: {
      true: "text-accent",
    },
  },
  defaultVariants: {
    variant: "default",
    isSaved: false,
  },
})

export type SaveButtonVariants = VariantProps<typeof saveButton>
