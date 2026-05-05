import { preview } from "@mise/storybook-config/preview"

import { Tabs as Component } from "."

const meta = preview.meta({
  parameters: { layout: "centered" },
  title: "Molecules/Tabs",
})

const Demo = () => (
  <Component.Root className="w-80" defaultValue="ingredients">
    <Component.List>
      <Component.Tab value="ingredients">Ingredients</Component.Tab>
      <Component.Tab value="method">Method</Component.Tab>
      <Component.Tab disabled value="notes">
        Notes
      </Component.Tab>
      <Component.Indicator />
    </Component.List>
    <Component.Panel className="pt-4 text-text-secondary" value="ingredients">
      Ingredients panel content.
    </Component.Panel>
    <Component.Panel className="pt-4 text-text-secondary" value="method">
      Method panel content.
    </Component.Panel>
    <Component.Panel className="pt-4 text-text-secondary" value="notes">
      Notes panel content.
    </Component.Panel>
  </Component.Root>
)

export const Default = meta.story({ render: () => <Demo /> })
export const Showcase = meta.story({ render: () => <Demo /> })
