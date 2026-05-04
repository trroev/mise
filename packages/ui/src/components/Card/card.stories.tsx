import { Badge } from "@mise/ui/components/Badge"
import { Card } from "@mise/ui/components/Card"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"

const meta = {
  title: "Components/Card",
  component: Card,
  parameters: { layout: "centered" },
  args: {
    href: "#",
    lockUp: {
      title: "Cassoulet de Toulouse",
      body: "A long-simmered classic of southern France.",
    },
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="w-72">
      <Card {...args} />
    </div>
  ),
}

export const Showcase: Story = {
  render: () => (
    <div className="grid w-[40rem] grid-cols-2 gap-6">
      <Card
        badges={<Badge variant="muted">Entrée</Badge>}
        href="#"
        lockUp={{ title: "Cassoulet de Toulouse", body: "Hearty bean stew." }}
      />
      <Card
        href="#"
        lockUp={{ title: "Pâte brisée", body: "Tender all-butter dough." }}
      />
    </div>
  ),
}
