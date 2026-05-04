import { Input } from "@mise/ui/components/Input"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"

const meta = {
  title: "Components/Input",
  component: Input,
  args: { placeholder: "Enter text…" },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Showcase: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <Input placeholder="Default" />
      <Input defaultValue="Filled" />
      <Input disabled placeholder="Disabled" />
      <Input error="Required" id="err" placeholder="With error" />
    </div>
  ),
}
