"use client"

import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox"
import { cn } from "@mise/ui/utils/cn"

export type CheckboxProps = React.ComponentProps<typeof BaseCheckbox.Root>

export const Checkbox = ({ className, ...props }: CheckboxProps) => (
  <BaseCheckbox.Root
    className={cn(
      "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-border bg-surface",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-checked:border-accent data-checked:bg-accent",
      "data-invalid:border-destructive",
      className
    )}
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
