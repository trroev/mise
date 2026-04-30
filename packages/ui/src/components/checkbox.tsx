"use client"

import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox"
import type { ComponentProps, Ref } from "react"
import { cn } from "../cn/cn"

export type CheckboxProps = ComponentProps<typeof BaseCheckbox.Root> & {
  ref?: Ref<HTMLButtonElement>
}

export const Checkbox = ({ className, ref, ...props }: CheckboxProps) => (
  <BaseCheckbox.Root
    className={cn(
      "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-border bg-surface",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-checked:border-accent data-checked:bg-accent",
      "data-invalid:border-destructive",
      className
    )}
    ref={ref}
    {...props}
  >
    <BaseCheckbox.Indicator className="flex text-accent-foreground data-unchecked:hidden">
      <CheckIcon />
    </BaseCheckbox.Indicator>
  </BaseCheckbox.Root>
)

const CheckIcon = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="14"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
    width="14"
  >
    <title>Checked</title>
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
