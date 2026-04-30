import { notFound } from "next/navigation"
import type React from "react"

import "../globals.css"

export default function DevLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") {
    notFound()
  }
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
