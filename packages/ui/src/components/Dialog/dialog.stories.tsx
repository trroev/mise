import { Button } from "@mise/ui/components/Button"
import { Dialog } from "@mise/ui/components/Dialog"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"

const meta = {
  title: "Components/Dialog",
  parameters: { layout: "centered" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const Template = ({ size = "md" as const }: { size?: "sm" | "md" | "lg" }) => (
  <Dialog.Root>
    <Dialog.Trigger render={<Button>Open dialog</Button>} />
    <Dialog.Portal>
      <Dialog.Backdrop />
      <Dialog.Popup size={size}>
        <Dialog.Title>Confirm action</Dialog.Title>
        <Dialog.Description>
          This action cannot be undone. Are you sure you want to continue?
        </Dialog.Description>
        <div className="mt-6 flex justify-end gap-2">
          <Dialog.Close render={<Button variant="ghost">Cancel</Button>} />
          <Dialog.Close
            render={<Button variant="destructive">Confirm</Button>}
          />
        </div>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
)

export const Default: Story = { render: () => <Template /> }

export const Showcase: Story = {
  render: () => (
    <div className="flex gap-3">
      <Template size="sm" />
      <Template size="md" />
      <Template size="lg" />
    </div>
  ),
}
