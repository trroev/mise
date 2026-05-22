"use client"

import { Menu as BaseMenu } from "@base-ui/react/menu"
import { cn } from "@mise/ui/utils/cn"
import type React from "react"

export type MenuRootProps = React.ComponentProps<typeof BaseMenu.Root>
export const MenuRoot = BaseMenu.Root

export type MenuTriggerProps = React.ComponentProps<typeof BaseMenu.Trigger>
export const MenuTrigger = ({ className, ...props }: MenuTriggerProps) => (
  <BaseMenu.Trigger
    className={cn(
      "inline-flex items-center justify-center",
      "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
      className
    )}
    {...props}
  />
)

export type MenuPortalProps = React.ComponentProps<typeof BaseMenu.Portal>
export const MenuPortal = BaseMenu.Portal

export type MenuBackdropProps = React.ComponentProps<typeof BaseMenu.Backdrop>
export const MenuBackdrop = BaseMenu.Backdrop

export type MenuPositionerProps = React.ComponentProps<
  typeof BaseMenu.Positioner
>
export const MenuPositioner = ({
  className,
  sideOffset = 8,
  ...props
}: MenuPositionerProps) => (
  <BaseMenu.Positioner
    className={cn("z-40 outline-hidden", className)}
    sideOffset={sideOffset}
    {...props}
  />
)

export type MenuPopupProps = React.ComponentProps<typeof BaseMenu.Popup>
export const MenuPopup = ({ className, ...props }: MenuPopupProps) => (
  <BaseMenu.Popup
    className={cn(
      "min-w-[12rem] origin-[var(--transform-origin)] rounded-md border border-border bg-surface py-1 text-text-primary shadow-lg outline-hidden",
      "transition-[scale,opacity] duration-150 ease-out",
      "data-starting-style:scale-[0.98] data-starting-style:opacity-0",
      "data-ending-style:scale-[0.98] data-ending-style:opacity-0",
      className
    )}
    {...props}
  />
)

export type MenuItemProps = React.ComponentProps<typeof BaseMenu.Item>
export const MenuItem = ({ className, ...props }: MenuItemProps) => (
  <BaseMenu.Item
    className={cn(
      "flex cursor-default select-none items-center px-3 py-2 text-body-sm outline-hidden",
      "data-highlighted:bg-secondary data-highlighted:text-text-primary",
      "data-disabled:cursor-not-allowed data-disabled:text-text-secondary/50",
      className
    )}
    {...props}
  />
)

export type MenuLinkItemProps = React.ComponentProps<typeof BaseMenu.LinkItem>
export const MenuLinkItem = ({ className, ...props }: MenuLinkItemProps) => (
  <BaseMenu.LinkItem
    className={cn(
      "flex cursor-pointer select-none items-center px-3 py-2 text-body-sm text-text-primary no-underline outline-hidden",
      "data-highlighted:bg-secondary",
      className
    )}
    {...props}
  />
)

export type MenuSeparatorProps = React.ComponentProps<typeof BaseMenu.Separator>
export const MenuSeparator = ({ className, ...props }: MenuSeparatorProps) => (
  <BaseMenu.Separator
    className={cn("mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
)

export type MenuGroupProps = React.ComponentProps<typeof BaseMenu.Group>
export const MenuGroup = BaseMenu.Group

export type MenuGroupLabelProps = React.ComponentProps<
  typeof BaseMenu.GroupLabel
>
export const MenuGroupLabel = ({
  className,
  ...props
}: MenuGroupLabelProps) => (
  <BaseMenu.GroupLabel
    className={cn(
      "select-none px-3 py-2 text-body-xs text-text-secondary",
      className
    )}
    {...props}
  />
)

export type MenuArrowProps = React.ComponentProps<typeof BaseMenu.Arrow>
export const MenuArrow = BaseMenu.Arrow
