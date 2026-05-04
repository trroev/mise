import { ToggleGroup } from "@mise/ui/components/ToggleGroup"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"

const meta = {
  title: "Components/ToggleGroup",
  parameters: { layout: "centered" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const Demo = () => (
  <ToggleGroup.Root defaultValue={["us"]}>
    <ToggleGroup.Item value="us">US</ToggleGroup.Item>
    <ToggleGroup.Item value="metric">Metric</ToggleGroup.Item>
  </ToggleGroup.Root>
)

export const Default: Story = { render: () => <Demo /> }
export const Showcase: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Demo />
      <ToggleGroup.Root defaultValue={["main"]}>
        <ToggleGroup.Item value="starter">Starter</ToggleGroup.Item>
        <ToggleGroup.Item value="main">Main</ToggleGroup.Item>
        <ToggleGroup.Item disabled value="dessert">
          Dessert
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </div>
  ),
}
