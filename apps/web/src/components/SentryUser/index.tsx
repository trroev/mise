"use client"

import { setUser } from "@sentry/nextjs"
import { useEffect } from "react"
import { useSession } from "~/features/auth/session"

export const SentryUser = (): null => {
  const { user } = useSession()
  useEffect(() => {
    if (user) {
      setUser({ id: user.id })
      return
    }
    setUser(null)
  }, [user])
  return null
}
