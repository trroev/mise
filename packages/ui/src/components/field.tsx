"use client"

import { Field as BaseField } from "@base-ui-components/react/field"
import type { ComponentProps, ReactNode, Ref } from "react"
import { cn } from "../cn/cn"

export type FieldProps = Omit<
  ComponentProps<typeof BaseField.Root>,
  "children"
> & {
  ref?: Ref<HTMLDivElement>
  label?: ReactNode
  hint?: ReactNode
  error?: string
  children: ReactNode
}

export const Field = ({
  className,
  label,
  hint,
  error,
  children,
  ref,
  invalid,
  ...props
}: FieldProps) => (
  <BaseField.Root
    className={cn("flex flex-col gap-1.5", className)}
    invalid={invalid ?? Boolean(error)}
    ref={ref}
    {...props}
  >
    {label ? (
      <BaseField.Label className="font-sans text-body-sm text-text-primary leading-none">
        {label}
      </BaseField.Label>
    ) : null}
    {children}
    {hint && !error ? (
      <BaseField.Description className="font-sans text-body-sm text-text-muted">
        {hint}
      </BaseField.Description>
    ) : null}
    {error ? (
      <BaseField.Error
        className="font-sans text-body-sm text-destructive"
        match={true}
      >
        {error}
      </BaseField.Error>
    ) : null}
  </BaseField.Root>
)
