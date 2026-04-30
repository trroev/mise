import type { Metadata } from "next"
import type React from "react"
import { cormorant, inter } from "~/fonts"
import { Providers } from "~/providers"

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
    <html className={`${cormorant.variable} ${inter.variable}`} lang="en">
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
