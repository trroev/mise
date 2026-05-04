import { Input } from "@mise/ui/components/Input"
import { Label } from "@mise/ui/components/Label"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"

const meta = {
  title: "Components/Label",
  component: Label,
  args: { children: "Label" },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Showcase: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" placeholder="you@example.com" />
    </div>
  ),
}
