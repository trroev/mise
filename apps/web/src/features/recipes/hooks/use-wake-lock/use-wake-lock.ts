"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type UseWakeLockResult = {
  request: () => Promise<void>
  release: () => Promise<void>
  isSupported: boolean
}

const isWakeLockSupported = (): boolean =>
  typeof navigator !== "undefined" && "wakeLock" in navigator

export const useWakeLock = (): UseWakeLockResult => {
  const sentinelRef = useRef<WakeLockSentinel | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported(isWakeLockSupported())
  }, [])

  const release = useCallback(async (): Promise<void> => {
    const sentinel = sentinelRef.current
    if (!sentinel) {
      return
    }
    sentinelRef.current = null
    try {
      await sentinel.release()
    } catch {
      // Releasing can race with the platform; swallow.
    }
  }, [])

  const request = useCallback(async (): Promise<void> => {
    if (!isWakeLockSupported()) {
      return
    }
    if (sentinelRef.current) {
      return
    }
    try {
      const sentinel = await navigator.wakeLock.request("screen")
      sentinelRef.current = sentinel
      sentinel.addEventListener("release", () => {
        if (sentinelRef.current === sentinel) {
          sentinelRef.current = null
        }
      })
    } catch {
      // Wake lock can fail (permission, low battery, etc.) — fail silently.
    }
  }, [])

  useEffect(
    () => () => {
      release().catch(() => {
        // Already handled inside release; nothing to do.
      })
    },
    [release]
  )

  return { request, release, isSupported }
}
