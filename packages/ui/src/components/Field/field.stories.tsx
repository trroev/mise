import { Field } from "@mise/ui/components/Field"
import { Input } from "@mise/ui/components/Input"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"

const meta = {
  title: "Components/Field",
  component: Field,
  args: {
    label: "Email",
    children: <Input id="email" placeholder="you@example.com" />,
  },
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Showcase: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-6">
      <Field label="Email">
        <Input id="f1" placeholder="you@example.com" />
      </Field>
      <Field hint="We never share your email." label="Email">
        <Input id="f2" placeholder="you@example.com" />
      </Field>
      <Field error="Required" label="Email">
        <Input id="f3" placeholder="you@example.com" />
      </Field>
      <Field disabled label="Email">
        <Input disabled id="f4" placeholder="you@example.com" />
      </Field>
    </div>
  ),
}
