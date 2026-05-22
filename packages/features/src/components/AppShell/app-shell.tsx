import type React from "react"
import { SiteFooter } from "./site-footer"
import { type HeaderAuth, SiteHeader } from "./site-header.client"

export type AppShellProps = {
  auth: HeaderAuth
  onSignOut?: () => void | Promise<void>
  children: React.ReactNode
}

export const AppShell = ({ auth, onSignOut, children }: AppShellProps) => (
  <>
    <SiteHeader auth={auth} onSignOut={onSignOut} />
    <main className="flex-1">{children}</main>
    <SiteFooter />
  </>
)
