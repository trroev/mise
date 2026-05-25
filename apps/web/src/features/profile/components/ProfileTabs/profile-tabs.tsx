"use client"

import { Tabs } from "@mise/ui/components/Tabs"
import { useRouter } from "next/navigation"
import { type ReactNode, useState } from "react"
import { match } from "ts-pattern"

export type ProfileTabValue = "my-recipes" | "saved" | "collections"

type ProfileTabsProps = {
  initialTab: ProfileTabValue
  myRecipes: ReactNode
  saved: ReactNode
  collections: ReactNode
}

const toTabValue = (value: unknown): ProfileTabValue =>
  match(value)
    .with("saved", () => "saved" as const)
    .with("collections", () => "collections" as const)
    .otherwise(() => "my-recipes" as const)

const buildHref = (tab: ProfileTabValue): string =>
  match(tab)
    .with("saved", () => "/profile?tab=saved")
    .with("collections", () => "/profile?tab=collections")
    .with("my-recipes", () => "/profile")
    .exhaustive()

export const ProfileTabs = ({
  initialTab,
  myRecipes,
  saved,
  collections,
}: ProfileTabsProps) => {
  const router = useRouter()
  const [value, setValue] = useState<ProfileTabValue>(initialTab)

  const handleValueChange = (next: unknown): void => {
    const nextValue = toTabValue(next)
    setValue(nextValue)
    router.replace(buildHref(nextValue), { scroll: false })
  }

  return (
    <Tabs.Root onValueChange={handleValueChange} value={value}>
      <Tabs.List>
        <Tabs.Tab value="my-recipes">My recipes</Tabs.Tab>
        <Tabs.Tab value="saved">Saved</Tabs.Tab>
        <Tabs.Tab value="collections">Collections</Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Panel className="pt-2" value="my-recipes">
        {myRecipes}
      </Tabs.Panel>
      <Tabs.Panel className="pt-2" value="saved">
        {saved}
      </Tabs.Panel>
      <Tabs.Panel className="pt-2" value="collections">
        {collections}
      </Tabs.Panel>
    </Tabs.Root>
  )
}
