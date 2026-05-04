import { Button } from "@mise/ui/components/Button"
import { Tooltip, TooltipProvider } from "@mise/ui/components/Tooltip"
import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite"

const withTooltipProvider: Decorator = (Story) => (
  <TooltipProvider>
    <Story />
  </TooltipProvider>
)

const meta = {
  title: "Components/Tooltip",
  parameters: { layout: "centered" },
  decorators: [withTooltipProvider],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tooltip content="Tooltip content">
      <Button variant="outline">Hover me</Button>
    </Tooltip>
  ),
}

export const Showcase: Story = {
  render: () => (
    <div className="flex gap-4">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Tooltip content={`On ${side}`} key={side} side={side}>
          <Button variant="outline">{side}</Button>
        </Tooltip>
      ))}
    </div>
  ),
}
