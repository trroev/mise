import { notFound } from "next/navigation"
import type React from "react"
import { cormorant, manrope } from "~/fonts"

import "../globals.css"

export default function DevLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") {
    notFound()
  }
  return (
    <html className={`${cormorant.variable} ${manrope.variable}`} lang="en">
      <body className="font-sans">{children}</body>
    </html>
  )
}
