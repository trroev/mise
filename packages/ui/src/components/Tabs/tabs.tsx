"use client"

import { Tabs as BaseTabs } from "@base-ui/react/tabs"
import { cn } from "@mise/ui/utils/cn"

export type TabsRootProps = React.ComponentProps<typeof BaseTabs.Root>
const TabsRoot = ({ className, ...props }: TabsRootProps) => (
  <BaseTabs.Root className={cn("flex flex-col gap-4", className)} {...props} />
)

export type TabsListProps = React.ComponentProps<typeof BaseTabs.List>
const TabsList = ({ className, ...props }: TabsListProps) => (
  <BaseTabs.List
    className={cn(
      "relative inline-flex items-center gap-1 border-border border-b",
      className
    )}
    {...props}
  />
)

export type TabsTabProps = React.ComponentProps<typeof BaseTabs.Tab>
const TabsTab = ({ className, ...props }: TabsTabProps) => (
  <BaseTabs.Tab
    className={cn(
      "relative inline-flex h-10 items-center justify-center whitespace-nowrap px-3 font-medium font-sans text-body-sm text-text-secondary transition-colors",
      "hover:text-text-primary",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "data-disabled:cursor-not-allowed data-disabled:opacity-50",
      "data-selected:text-text-primary",
      className
    )}
    {...props}
  />
)

export type TabsIndicatorProps = React.ComponentProps<typeof BaseTabs.Indicator>
const TabsIndicator = ({ className, ...props }: TabsIndicatorProps) => (
  <BaseTabs.Indicator
    className={cn(
      "absolute bottom-0 left-0 h-0.5 w-(--active-tab-width) translate-x-(--active-tab-left) bg-accent transition-[transform,width] duration-200",
      className
    )}
    {...props}
  />
)

export type TabsPanelProps = React.ComponentProps<typeof BaseTabs.Panel>
const TabsPanel = ({ className, ...props }: TabsPanelProps) => (
  <BaseTabs.Panel
    className={cn(
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      className
    )}
    {...props}
  />
)

export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Tab: TabsTab,
  Indicator: TabsIndicator,
  Panel: TabsPanel,
}
