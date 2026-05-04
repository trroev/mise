import { Pagination } from "@mise/ui/components/Pagination"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"

const noop = () => undefined

const meta = {
  title: "Components/Pagination",
  component: Pagination,
  parameters: { layout: "centered" },
  args: { currentPage: 3, totalPages: 10, onPageChange: noop },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

const Interactive = ({ totalPages }: { totalPages: number }) => {
  const [page, setPage] = useState(1)
  return (
    <Pagination
      currentPage={page}
      onPageChange={setPage}
      totalPages={totalPages}
    />
  )
}

export const Showcase: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Interactive totalPages={3} />
      <Interactive totalPages={10} />
      <Interactive totalPages={50} />
    </div>
  ),
}
