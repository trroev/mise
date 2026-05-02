"use client"

import { NavigationMenu } from "@mise/ui/components/NavigationMenu"
import { cn } from "@mise/ui/utils/cn"
import { RiCloseLine, RiMenuLine } from "@remixicon/react"
import Link from "next/link"
import type React from "react"
import { useEffect, useState } from "react"

export type SiteHeaderProps = {
  className?: string
}

export const SiteHeader = ({
  className,
}: SiteHeaderProps): React.JSX.Element => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [navValue, setNavValue] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-200",
        isScrolled || navValue
          ? "border-border/40 border-b bg-background/80 backdrop-blur-md"
          : "border-transparent border-b",
        className
      )}
    >
      <div className="constrainer flex h-16 items-center justify-between">
        <Link
          className="font-display text-heading-md text-text-primary"
          href="/"
        >
          Mise
        </Link>

        <NavigationMenu.Root
          aria-label="Site navigation"
          onValueChange={(value) => setNavValue(value)}
          value={navValue}
        >
          {/* Desktop nav links */}
          <NavigationMenu.List className="hidden gap-6 md:flex">
            <NavigationMenu.Item>
              <NavigationMenu.Link
                className="text-body text-text-secondary hover:text-text-primary"
                render={<Link href="/recipes" />}
              >
                Recipes
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          </NavigationMenu.List>

          {/* Mobile hamburger */}
          <NavigationMenu.List className="flex md:hidden">
            <NavigationMenu.Item value="mobile">
              <NavigationMenu.Trigger
                aria-label={
                  navValue ? "Close navigation menu" : "Open navigation menu"
                }
                className="h-9 w-9"
              >
                {navValue ? (
                  <RiCloseLine aria-hidden size={20} />
                ) : (
                  <RiMenuLine aria-hidden size={20} />
                )}
              </NavigationMenu.Trigger>
              <NavigationMenu.Portal>
                <NavigationMenu.Positioner
                  className={cn(
                    "z-30 size-full",
                    "transition-[top,left,right,bottom] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    "data-instant:transition-none"
                  )}
                  collisionPadding={0}
                >
                  <NavigationMenu.Popup
                    className={cn(
                      "flex size-full flex-col bg-background p-6",
                      "transition-[opacity,translate] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      "data-starting-style:-translate-y-16 data-starting-style:opacity-0",
                      "data-ending-style:-translate-y-16 data-ending-style:opacity-0",
                      "data-ending-style:duration-150 data-ending-style:ease-in"
                    )}
                  >
                    <ul className="flex flex-col space-y-4">
                      <li>
                        <NavigationMenu.Link
                          className="text-heading-md text-text-primary hover:text-text-secondary"
                          closeOnClick
                          render={<Link href="/recipes" />}
                        >
                          Recipes
                        </NavigationMenu.Link>
                      </li>
                    </ul>
                  </NavigationMenu.Popup>
                </NavigationMenu.Positioner>
              </NavigationMenu.Portal>
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu.Root>
      </div>
    </header>
  )
}
