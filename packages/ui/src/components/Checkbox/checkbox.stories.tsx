import { Checkbox } from "@mise/ui/components/Checkbox"
import { Label } from "@mise/ui/components/Label"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
} satisfies Meta<typeof Checkbox>

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
    <Checkbox defaultChecked={defaultChecked} disabled={disabled} id={id} />
    <Label htmlFor={id}>{label}</Label>
  </div>
)

export const Showcase: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Row id="cb-default" label="Default" />
      <Row defaultChecked id="cb-checked" label="Checked" />
      <Row disabled id="cb-disabled" label="Disabled" />
      <Row
        defaultChecked
        disabled
        id="cb-disabled-checked"
        label="Disabled checked"
      />
    </div>
  ),
}
