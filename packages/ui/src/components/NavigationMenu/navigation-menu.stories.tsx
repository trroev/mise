import { NavigationMenu } from "@mise/ui/components/NavigationMenu"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"

const meta = {
  title: "Components/NavigationMenu",
  parameters: { layout: "centered" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const Demo = () => (
  <NavigationMenu.Root>
    <NavigationMenu.List className="gap-4">
      <NavigationMenu.Item>
        <NavigationMenu.Trigger className="px-3 py-2">
          Recipes
        </NavigationMenu.Trigger>
        <NavigationMenu.Content className="rounded-md border border-border bg-surface p-4">
          <NavigationMenu.Link href="#">All recipes</NavigationMenu.Link>
        </NavigationMenu.Content>
      </NavigationMenu.Item>
      <NavigationMenu.Item>
        <NavigationMenu.Link className="px-3 py-2" href="#about">
          About
        </NavigationMenu.Link>
      </NavigationMenu.Item>
    </NavigationMenu.List>
    <NavigationMenu.Portal>
      <NavigationMenu.Positioner>
        <NavigationMenu.Popup>
          <NavigationMenu.Viewport />
        </NavigationMenu.Popup>
      </NavigationMenu.Positioner>
    </NavigationMenu.Portal>
  </NavigationMenu.Root>
)

export const Default: Story = { render: () => <Demo /> }
export const Showcase: Story = { render: () => <Demo /> }
