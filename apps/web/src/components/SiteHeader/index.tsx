"use client"

import { NavigationMenu } from "@mise/ui/components/NavigationMenu"
import { cn } from "@mise/ui/utils/cn"
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
        isScrolled
          ? "border-border/40 border-b bg-background/80 backdrop-blur-md"
          : "border-transparent border-b",
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
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
                {navValue ? <CloseIcon /> : <MenuIcon />}
              </NavigationMenu.Trigger>
              <NavigationMenu.Portal>
                <NavigationMenu.Backdrop />
                {/*
                 * positionMethod="fixed" + !inset-0: CSS !important overrides
                 * FloatingUI's computed top/left inline styles, making the
                 * positioner fill the viewport regardless of trigger position.
                 */}
                <NavigationMenu.Positioner
                  className="inset-0! z-50 w-auto!"
                  positionMethod="fixed"
                >
                  <NavigationMenu.Popup
                    className={cn(
                      "flex h-full w-full flex-col p-6",
                      "data-ending-style:opacity-0 data-starting-style:opacity-0",
                      "transition-opacity duration-200"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        className="font-display text-heading-md text-text-primary"
                        href="/"
                        onClick={() => setNavValue(null)}
                      >
                        Mise
                      </Link>
                      <button
                        aria-label="Close navigation menu"
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-md",
                          "text-text-secondary transition-colors hover:text-text-primary",
                          "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
                        )}
                        onClick={() => setNavValue(null)}
                        type="button"
                      >
                        <CloseIcon />
                      </button>
                    </div>
                    <ul className="mt-8 flex flex-col gap-4">
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

const MenuIcon = (): React.JSX.Element => (
  <svg
    aria-hidden="true"
    fill="none"
    height="20"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <line x1="3" x2="21" y1="6" y2="6" />
    <line x1="3" x2="21" y1="12" y2="12" />
    <line x1="3" x2="21" y1="18" y2="18" />
  </svg>
)

const CloseIcon = (): React.JSX.Element => (
  <svg
    aria-hidden="true"
    fill="none"
    height="20"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <line x1="18" x2="6" y1="6" y2="18" />
    <line x1="6" x2="18" y1="6" y2="18" />
  </svg>
)
