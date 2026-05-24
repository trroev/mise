"use client"

import { Tabs } from "@mise/ui/components/Tabs"
import { useRouter } from "next/navigation"
import { type ReactNode, useState } from "react"
import { match } from "ts-pattern"

export type ProfileTabValue = "my-recipes" | "saved"

type ProfileTabsProps = {
  initialTab: ProfileTabValue
  myRecipes: ReactNode
  saved: ReactNode
}

const toTabValue = (value: unknown): ProfileTabValue =>
  match(value)
    .with("saved", () => "saved" as const)
    .otherwise(() => "my-recipes" as const)

const buildHref = (tab: ProfileTabValue): string =>
  match(tab)
    .with("saved", () => "/profile?tab=saved")
    .with("my-recipes", () => "/profile")
    .exhaustive()

export const ProfileTabs = ({
  initialTab,
  myRecipes,
  saved,
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
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Panel className="pt-2" value="my-recipes">
        {myRecipes}
      </Tabs.Panel>
      <Tabs.Panel className="pt-2" value="saved">
        {saved}
      </Tabs.Panel>
    </Tabs.Root>
  )
}
