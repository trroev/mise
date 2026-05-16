import { env } from "@mise/env/app"
import { AppShell } from "@mise/features/components/AppShell"
import type { Metadata, Viewport } from "next"
import type React from "react"
import { cormorant, manrope } from "~/fonts"

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

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html className={`${cormorant.variable} ${manrope.variable}`} lang="en">
      <body className="flex min-h-dvh flex-col font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
