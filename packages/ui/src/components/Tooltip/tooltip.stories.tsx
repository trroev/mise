import { preview } from "@mise/storybook-config/preview"
import { Button } from "@mise/ui/components/Button"
import type { Decorator } from "@storybook/nextjs-vite"

import { Tooltip as Component, TooltipProvider } from "./tooltip"

const withTooltipProvider: Decorator = (Story) => (
  <TooltipProvider>
    <Story />
  </TooltipProvider>
)

const meta = preview.meta({
  args: {
    content: "Tooltip content",
    children: <Button variant="outline">Hover me</Button>,
  },
  argTypes: {
    children: { table: { disable: true } },
    side: {
      control: "inline-radio",
      options: ["top", "right", "bottom", "left"],
    },
  },
  component: Component,
  decorators: [withTooltipProvider],
  parameters: { layout: "centered" },
  title: "Molecules/Tooltip",
})

export const Default = meta.story({})

export const Showcase = meta.story({
  render: () => (
    <div className="flex gap-4">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Component content={`On ${side}`} key={side} side={side}>
          <Button variant="outline">{side}</Button>
        </Component>
      ))}
    </div>
  ),
})
