import { cn } from "@mise/ui/utils/cn"
import { cloneElement, type ReactElement } from "react"
import { type ButtonVariants, button } from "./button.variants"

type RenderFn = (
  props: React.ComponentProps<"button">
) => ReactElement<Record<string, unknown>>

export type ButtonProps = React.ComponentProps<"button"> &
  ButtonVariants & {
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
