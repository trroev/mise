import { Label } from "@mise/ui/components/Label"
import { Switch } from "@mise/ui/components/Switch"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"

const meta = {
  title: "Components/Switch",
  component: Switch,
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

type RowProps = {
  id: string
  label: string
  defaultChecked?: boolean
  disabled?: boolean
}

const Row = ({ id, label, defaultChecked, disabled }: RowProps) => (
  <div className="flex items-center gap-2">
    <Switch defaultChecked={defaultChecked} disabled={disabled} id={id} />
    <Label htmlFor={id}>{label}</Label>
  </div>
)

export const Showcase: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Row id="sw-off" label="Off" />
      <Row defaultChecked id="sw-on" label="On" />
      <Row disabled id="sw-disabled" label="Disabled" />
      <Row defaultChecked disabled id="sw-disabled-on" label="Disabled on" />
    </div>
  ),
}
