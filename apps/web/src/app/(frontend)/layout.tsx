import { SessionProvider } from "@mise/auth/session"
import { AppShell } from "@mise/chrome/components/AppShell"
import { env } from "@mise/env/app"
import type { HeaderAuth } from "@mise/types/HeaderAuth"
import type { Metadata, Viewport } from "next"
import { headers } from "next/headers"
import type React from "react"
import { Toaster } from "sonner"
import { QueryProvider } from "~/components/QueryProvider"
import { SentryUser } from "~/components/SentryUser"
import { signOutAction } from "~/features/auth/actions/sign-out"
import { auth } from "~/features/auth/auth.server"
import { cormorant, manrope } from "~/fonts"
import { getPayloadUserByBetterAuthId } from "~/lib/queries/payload-user-by-better-auth-id"

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

const WHITESPACE_RE = /\s+/

const buildInitials = (source: string): string =>
  source
    .split(WHITESPACE_RE)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") ||
  source.charAt(0).toUpperCase() ||
  "?"

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })

  let headerAuth: HeaderAuth = { status: "anonymous" }
  if (session) {
    const payloadUser = await getPayloadUserByBetterAuthId(session.user.id)
    const avatarUrl =
      payloadUser &&
      typeof payloadUser.avatar === "object" &&
      payloadUser.avatar
        ? (payloadUser.avatar.url ?? null)
        : null
    const displayName = session.user.name ?? session.user.email
    headerAuth = {
      status: "signed-in",
      displayName,
      initials: buildInitials(displayName),
      avatarUrl,
      onSignOut: async () => {
        "use server"
        await signOutAction()
      },
    }
  }

  return (
    <html
      className={`${cormorant.variable} ${manrope.variable}`}
      data-scroll-behavior="smooth"
      lang="en"
    >
      <body className="flex min-h-dvh flex-col font-sans">
        <SessionProvider initialUser={session?.user ?? null}>
          <QueryProvider>
            <SentryUser />
            <AppShell auth={headerAuth}>{children}</AppShell>
            <Toaster position="bottom-right" richColors />
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
