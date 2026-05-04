import { Toggle } from "@mise/ui/components/Toggle"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"

const meta = {
  title: "Components/Toggle",
  component: Toggle,
  args: { children: "Toggle" },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "outline", "ghost", "destructive"],
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg", "icon"],
    },
  },
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Showcase: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Toggle>Off</Toggle>
      <Toggle defaultPressed>On</Toggle>
      <Toggle disabled>Disabled</Toggle>
      <Toggle defaultPressed disabled>
        Disabled pressed
      </Toggle>
    </div>
  ),
}
