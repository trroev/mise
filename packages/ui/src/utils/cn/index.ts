import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

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

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [...FONT_SIZES] }],
    },
  },
})

export const cn = (...inputs: Array<ClassValue>): string =>
  twMerge(clsx(inputs))
