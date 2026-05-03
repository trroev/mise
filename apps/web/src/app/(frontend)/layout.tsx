import type { Metadata } from "next"
import type React from "react"
import { SiteFooter } from "~/components/SiteFooter"
import { SiteHeader } from "~/components/SiteHeader"
import { cormorant, manrope } from "~/fonts"

import "../globals.css"

export const metadata: Metadata = {
  title: "Mise",
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
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
