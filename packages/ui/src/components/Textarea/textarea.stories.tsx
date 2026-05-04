import { Textarea } from "@mise/ui/components/Textarea"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  args: { placeholder: "Notes…" },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Showcase: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <Textarea placeholder="Default" />
      <Textarea defaultValue="Filled" />
      <Textarea disabled placeholder="Disabled" />
      <Textarea error="Required" id="t-err" placeholder="With error" />
    </div>
  ),
}
