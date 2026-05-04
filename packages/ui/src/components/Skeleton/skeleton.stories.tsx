import { Skeleton, type SkeletonProps } from "@mise/ui/components/Skeleton"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  argTypes: {
    variant: { control: "inline-radio", options: ["block", "text"] },
  },
}

export default meta
type Story = StoryObj<typeof Skeleton>

export const Default: Story = {
  render: (args: SkeletonProps) => (
    <div className="w-80">
      <Skeleton {...args} />
    </div>
  ),
}

export const Showcase: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <Skeleton variant="block" />
      <Skeleton variant="text" />
      <Skeleton variant="text" />
      <Skeleton variant="text" />
    </div>
  ),
}
