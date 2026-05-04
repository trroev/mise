import { RadioGroup } from "@mise/ui/components/RadioGroup"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"

const COURSE_OPTIONS = [
  { value: "starter", label: "Starter" },
  { value: "main", label: "Main" },
  { value: "dessert", label: "Dessert" },
] as const

const meta = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  args: { options: COURSE_OPTIONS, defaultValue: "main" },
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Showcase: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <RadioGroup defaultValue="main" options={COURSE_OPTIONS} />
      <RadioGroup
        defaultValue="main"
        options={[
          ...COURSE_OPTIONS,
          { value: "dis", label: "Disabled", disabled: true },
        ]}
      />
      <RadioGroup disabled options={COURSE_OPTIONS} />
    </div>
  ),
}
