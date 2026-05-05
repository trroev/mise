import { preview } from "@mise/storybook-config/preview"

import { NavigationMenu as Component } from "."

const meta = preview.meta({
  parameters: { layout: "fullscreen" },
  title: "Organisms/NavigationMenu",
})

const Demo = () => (
  <Component.Root>
    <Component.List className="gap-4">
      <Component.Item>
        <Component.Trigger className="px-3 py-2">Recipes</Component.Trigger>
        <Component.Content className="rounded-md border border-border bg-surface p-4">
          <Component.Link href="#all">All recipes</Component.Link>
        </Component.Content>
      </Component.Item>
      <Component.Item>
        <Component.Link className="px-3 py-2" href="#about">
          About
        </Component.Link>
      </Component.Item>
    </Component.List>
    <Component.Portal>
      <Component.Positioner>
        <Component.Popup>
          <Component.Viewport />
        </Component.Popup>
      </Component.Positioner>
    </Component.Portal>
  </Component.Root>
)

export const Default = meta.story({
  render: () => (
    <div className="flex min-h-dvh items-center justify-center p-8">
      <Demo />
    </div>
  ),
})

export const Showcase = meta.story({
  render: () => (
    <div className="flex min-h-dvh items-center justify-center p-8">
      <Demo />
    </div>
  ),
})
