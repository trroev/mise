"use client"

import { Popover as BasePopover } from "@base-ui/react/popover"
import { cn } from "@mise/ui/utils/cn"

export type PopoverRootProps = React.ComponentProps<typeof BasePopover.Root>
export const PopoverRoot = BasePopover.Root

export type PopoverTriggerProps = React.ComponentProps<
  typeof BasePopover.Trigger
>
export const PopoverTrigger = BasePopover.Trigger

export type PopoverPortalProps = React.ComponentProps<typeof BasePopover.Portal>
export const PopoverPortal = BasePopover.Portal

export type PopoverCloseProps = React.ComponentProps<typeof BasePopover.Close>
export const PopoverClose = BasePopover.Close

export type PopoverPositionerProps = React.ComponentProps<
  typeof BasePopover.Positioner
>

export type PopoverPopupProps = React.ComponentProps<typeof BasePopover.Popup> &
  Pick<PopoverPositionerProps, "side" | "sideOffset" | "align" | "alignOffset">

export const PopoverPopup = ({
  className,
  side = "bottom",
  sideOffset = 8,
  align = "center",
  alignOffset = 0,
  ...props
}: PopoverPopupProps) => (
  <BasePopover.Portal>
    <BasePopover.Positioner
      align={align}
      alignOffset={alignOffset}
      className="z-50 outline-none"
      side={side}
      sideOffset={sideOffset}
    >
      <BasePopover.Popup
        className={cn(
          "rounded-lg border border-border bg-surface p-4 shadow-lg",
          "focus:outline-none",
          "data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
          "data-[ending-style]:scale-95 data-[starting-style]:scale-95",
          "transition-[opacity,transform] duration-150",
          className
        )}
        {...props}
      />
    </BasePopover.Positioner>
  </BasePopover.Portal>
)

export type PopoverTitleProps = React.ComponentProps<typeof BasePopover.Title>
export const PopoverTitle = ({ className, ...props }: PopoverTitleProps) => (
  <BasePopover.Title
    className={cn("font-display text-heading-sm text-text-primary", className)}
    {...props}
  />
)

export type PopoverDescriptionProps = React.ComponentProps<
  typeof BasePopover.Description
>
export const PopoverDescription = ({
  className,
  ...props
}: PopoverDescriptionProps) => (
  <BasePopover.Description
    className={cn("text-body-sm text-text-secondary", className)}
    {...props}
  />
)
