"use client"

import { Select as BaseSelect } from "@base-ui/react/select"
import type { ComponentProps, ReactNode, Ref } from "react"
import { cn } from "../cn/cn"

export type SelectOption = {
  value: string
  label: string
}

export type SelectProps = ComponentProps<typeof BaseSelect.Root> & {
  ref?: Ref<HTMLDivElement>
  placeholder?: string
  error?: string
  options: ReadonlyArray<SelectOption>
  className?: string
  id?: string
  triggerClassName?: string
}

export const Select = ({
  className,
  triggerClassName,
  placeholder = "Select…",
  error,
  options,
  ref,
  id,
  ...props
}: SelectProps) => {
  const errorId = error && id ? `${id}-error` : undefined
  return (
    <div className={cn("w-full", className)} ref={ref}>
      <BaseSelect.Root {...props}>
        <BaseSelect.Trigger
          aria-describedby={errorId}
          aria-invalid={error ? "true" : undefined}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border bg-surface px-3 py-2 font-sans text-body text-text-primary",
            "data-placeholder:text-text-muted",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-destructive focus-visible:ring-destructive"
              : "border-border",
            triggerClassName
          )}
          id={id}
        >
          <BaseSelect.Value>
            {(value: string | null) => {
              if (value == null || value === "") {
                return <span className="text-text-muted">{placeholder}</span>
              }
              return options.find((o) => o.value === value)?.label ?? value
            }}
          </BaseSelect.Value>
          <BaseSelect.Icon className="ml-2 text-text-muted">
            <ChevronIcon />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
        <BaseSelect.Portal>
          <BaseSelect.Positioner className="z-50 outline-none" sideOffset={4}>
            <BaseSelect.Popup className="max-h-[var(--available-height)] min-w-[var(--anchor-width)] overflow-y-auto rounded-md border border-border bg-surface py-1 shadow-md">
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
      {error ? (
        <span
          className="mt-1 block font-sans text-body-sm text-destructive"
          id={errorId}
          role="alert"
        >
          {error}
        </span>
      ) : null}
    </div>
  )
}

const SelectItem = ({
  value,
  children,
}: {
  value: string
  children: ReactNode
}) => (
  <BaseSelect.Item
    className={cn(
      "flex cursor-default select-none items-center justify-between px-3 py-2 font-sans text-body text-text-primary outline-none",
      "data-highlighted:bg-background data-highlighted:text-text-primary",
      "data-selected:bg-accent data-selected:text-accent-foreground"
    )}
    value={value}
  >
    <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
  </BaseSelect.Item>
)

const ChevronIcon = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="14"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="14"
  >
    <title>Open</title>
    <polyline points="6 9 12 15 18 9" />
  </svg>
)
