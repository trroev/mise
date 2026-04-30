"use client"

import { cn } from "@mise/ui/utils/cn"
import type { InputHTMLAttributes, Ref } from "react"

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  ref?: Ref<HTMLInputElement>
  error?: string
}

export const Input = ({ className, error, ref, id, ...props }: InputProps) => {
  const errorId = error && id ? `${id}-error` : undefined
  return (
    <>
      <input
        aria-describedby={errorId}
        aria-invalid={error ? "true" : undefined}
        className={cn(
          "flex h-10 w-full rounded-md border bg-surface px-3 py-2 font-sans text-body text-text-primary",
          "placeholder:text-text-muted",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-destructive focus-visible:ring-destructive"
            : "border-border",
          className
        )}
        id={id}
        ref={ref}
        {...props}
      />
      {error ? (
        <span
          className="mt-1 block font-sans text-body-sm text-destructive"
          id={errorId}
          role="alert"
        >
          {error}
        </span>
      ) : null}
    </>
  )
}
