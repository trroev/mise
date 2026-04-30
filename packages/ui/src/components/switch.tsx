"use client"

import { Switch as BaseSwitch } from "@base-ui/react/switch"
import type { ComponentProps, Ref } from "react"
import { cn } from "../cn/cn"

export type SwitchProps = ComponentProps<typeof BaseSwitch.Root> & {
  ref?: Ref<HTMLButtonElement>
}

export const Switch = ({ className, ref, ...props }: SwitchProps) => (
  <BaseSwitch.Root
    className={cn(
      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-border transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-checked:bg-accent",
      className
    )}
    ref={ref}
    {...props}
  >
    <BaseSwitch.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 translate-x-0 rounded-full bg-surface shadow-sm transition-transform",
        "data-checked:translate-x-5"
      )}
    />
  </BaseSwitch.Root>
)
