import type { LabelHTMLAttributes, Ref } from "react"
import { cn } from "../cn/cn"

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  ref?: Ref<HTMLLabelElement>
}

export const Label = ({ className, ref, ...props }: LabelProps) => (
  // biome-ignore lint/a11y/noLabelWithoutControl: consumer wires htmlFor or wraps a control
  <label
    className={cn(
      "font-sans text-body-sm text-text-primary leading-none",
      "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
)
