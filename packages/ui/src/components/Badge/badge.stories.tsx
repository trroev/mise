import { Badge } from "@mise/ui/components/Badge"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"

const meta = {
  title: "Components/Badge",
  component: Badge,
  args: { children: "Badge" },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "muted"] },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Showcase: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge>Default</Badge>
      <Badge variant="muted">Muted</Badge>
    </div>
  ),
}
