import type React from "react"
import { SiteFooter } from "./site-footer"
import { SiteHeader } from "./site-header.client"

export type AppShellProps = {
  children: React.ReactNode
}

export const AppShell = ({ children }: AppShellProps): React.JSX.Element => (
  <>
    <SiteHeader />
    <main className="flex-1">{children}</main>
    <SiteFooter />
  </>
)
