import {
  type ButtonHTMLAttributes,
  cloneElement,
  type ReactElement,
  type Ref,
} from "react"
import { tv, type VariantProps } from "tailwind-variants"
import { cn } from "../cn/cn"

const button = tv({
  base: cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium font-sans transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50"
  ),
  variants: {
    variant: {
      primary: "bg-accent text-accent-foreground hover:bg-accent-hover",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
      outline:
        "border border-border bg-transparent text-text-primary hover:bg-surface",
      ghost: "bg-transparent text-text-primary hover:bg-surface",
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive-hover",
    },
    size: {
      sm: "h-8 px-3 text-body-sm",
      md: "h-10 px-4 text-body",
      lg: "h-12 px-6 text-body-lg",
      icon: "h-10 w-10",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
})

export type ButtonVariants = VariantProps<typeof button>

type RenderFn = (
  props: ButtonHTMLAttributes<HTMLElement>
) => ReactElement<Record<string, unknown>>

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariants & {
    ref?: Ref<HTMLButtonElement>
    render?: ReactElement<Record<string, unknown>> | RenderFn
  }

export const Button = ({
  className,
  variant,
  size,
  render,
  ref,
  type = "button",
  ...props
}: ButtonProps) => {
  const mergedClassName = button({ variant, size, className })

  if (typeof render === "function") {
    return render({ ...props, className: mergedClassName })
  }

  if (render) {
    const renderProps = render.props
    return cloneElement(render, {
      ...props,
      ...renderProps,
      className: cn(mergedClassName, renderProps.className as string),
    })
  }

  return <button className={mergedClassName} ref={ref} type={type} {...props} />
}
