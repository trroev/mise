import "server-only"

import { headers } from "next/headers"
import { getPayload } from "payload"
import { auth } from "~/features/auth/auth.server"
import type { Viewer } from "~/lib/policies/viewer"
import config from "~/payload.config"
import { getPayloadUserByBetterAuthId } from "./payload-user-by-better-auth-id"

/**
 * Resolves the current authenticated viewer from request headers.
 *
 * Checks the Payload admin session first, then falls back to the better-auth
 * user session. Returns `null` when no session is present.
 *
 * Pass the returned value to any policy in `lib/policies` to make
 * authorization decisions.
 */
export const getCurrentViewer = async (): Promise<Viewer> => {
  const requestHeaders = await headers()
  const payload = await getPayload({ config })
  const { user: adminUser } = await payload.auth({ headers: requestHeaders })
  if (adminUser?.collection === "admins") {
    return { kind: "admin", admin: adminUser }
  }
  const session = await auth.api.getSession({ headers: requestHeaders })
  if (!session) {
    return null
  }
  const user = await getPayloadUserByBetterAuthId(session.user.id)
  return user ? { kind: "user", user } : null
}
