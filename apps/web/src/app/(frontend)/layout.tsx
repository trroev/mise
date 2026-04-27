import type { Metadata } from "next"
import type React from "react"
import { Providers } from "./providers"

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
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
