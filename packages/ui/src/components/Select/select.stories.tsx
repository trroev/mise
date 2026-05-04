import { Select } from "@mise/ui/components/Select"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"

const COURSE_OPTIONS = [
  { value: "starter", label: "Starter" },
  { value: "main", label: "Main" },
  { value: "dessert", label: "Dessert" },
]

const meta = {
  title: "Components/Select",
  component: Select,
  args: { options: COURSE_OPTIONS, placeholder: "Choose a course" },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Showcase: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Select options={COURSE_OPTIONS} placeholder="Default" />
      <Select defaultValue="main" options={COURSE_OPTIONS} />
      <Select disabled options={COURSE_OPTIONS} placeholder="Disabled" />
      <Select
        error="Required"
        id="s-err"
        options={COURSE_OPTIONS}
        placeholder="Error"
      />
    </div>
  ),
}
