import { Button as BaseButton } from "@base-ui/react/button"
import { type ButtonVariants, button } from "./button.variants"

export type ButtonProps = Omit<
  React.ComponentProps<typeof BaseButton>,
  "className"
> &
  ButtonVariants & {
    className?: string
  }

export const Button = ({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) => (
  <BaseButton
    className={button({ variant, size, className })}
    type={type}
    {...props}
  />
)
