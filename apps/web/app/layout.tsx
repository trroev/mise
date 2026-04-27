import type { Metadata } from "next"
import type React from "react"

export const metadata: Metadata = {
  title: "Mise",
  description: "A personal recipe collection.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children as React.ReactElement
}
