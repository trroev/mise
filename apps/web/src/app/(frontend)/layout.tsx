import { env } from "@mise/env/app"
import { AppShell } from "@mise/features/components/AppShell"
import type { Metadata, Viewport } from "next"
import { headers } from "next/headers"
import type React from "react"
import { cormorant, manrope } from "~/fonts"
import { auth } from "~/lib/auth.server"
import { SessionProvider } from "~/lib/session"

import "../globals.css"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(env.BASE_URL),
  title: { template: "%s | Mise", default: "Mise" },
  description: "A personal recipe collection.",
}

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  return (
    <html className={`${cormorant.variable} ${manrope.variable}`} lang="en">
      <body className="flex min-h-dvh flex-col font-sans">
        <SessionProvider initialUser={session?.user ?? null}>
          <AppShell>{children}</AppShell>
        </SessionProvider>
      </body>
    </html>
  )
}
