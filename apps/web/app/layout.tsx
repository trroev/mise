import type { Metadata } from "next"

import "@mise/tailwind"

export const metadata: Metadata = {
  title: "Mise",
  description: "A personal recipe collection.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
