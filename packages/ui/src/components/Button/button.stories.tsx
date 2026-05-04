import { Button } from "@mise/ui/components/Button"
import { RiArrowRightLine } from "@remixicon/react"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"

const meta = {
  title: "Components/Button",
  component: Button,
  args: { children: "Button" },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "outline", "ghost", "destructive"],
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg", "icon"],
    },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Showcase: Story = {
  render: () => (
    <div className="space-y-6">
      {(
        ["primary", "secondary", "outline", "ghost", "destructive"] as const
      ).map((variant) => (
        <div className="flex flex-wrap items-center gap-3" key={variant}>
          <Button size="sm" variant={variant}>
            Small
          </Button>
          <Button size="md" variant={variant}>
            Medium
          </Button>
          <Button size="lg" variant={variant}>
            Large
          </Button>
          <Button size="icon" variant={variant}>
            <RiArrowRightLine aria-hidden="true" size={16} />
          </Button>
          <Button disabled variant={variant}>
            Disabled
          </Button>
        </div>
      ))}
    </div>
  ),
}
