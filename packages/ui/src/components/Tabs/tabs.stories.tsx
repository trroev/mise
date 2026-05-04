import { Tabs } from "@mise/ui/components/Tabs"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"

const meta = {
  title: "Components/Tabs",
  parameters: { layout: "centered" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const Demo = () => (
  <Tabs.Root className="w-80" defaultValue="ingredients">
    <Tabs.List>
      <Tabs.Tab value="ingredients">Ingredients</Tabs.Tab>
      <Tabs.Tab value="method">Method</Tabs.Tab>
      <Tabs.Tab disabled value="notes">
        Notes
      </Tabs.Tab>
      <Tabs.Indicator />
    </Tabs.List>
    <Tabs.Panel className="pt-4 text-text-secondary" value="ingredients">
      Ingredients panel content.
    </Tabs.Panel>
    <Tabs.Panel className="pt-4 text-text-secondary" value="method">
      Method panel content.
    </Tabs.Panel>
    <Tabs.Panel className="pt-4 text-text-secondary" value="notes">
      Notes panel content.
    </Tabs.Panel>
  </Tabs.Root>
)

export const Default: Story = { render: () => <Demo /> }
export const Showcase: Story = { render: () => <Demo /> }
