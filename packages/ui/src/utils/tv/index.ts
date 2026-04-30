import { createTV } from "tailwind-variants"

const FONT_SIZES = [
  "display",
  "heading-xl",
  "heading-lg",
  "heading-md",
  "body-lg",
  "body",
  "body-sm",
  "caption",
  "label",
] as const

export const tv = createTV({
  twMergeConfig: {
    extend: {
      classGroups: {
        "font-size": [{ text: [...FONT_SIZES] }],
      },
    },
  },
})

export type { VariantProps } from "tailwind-variants"
