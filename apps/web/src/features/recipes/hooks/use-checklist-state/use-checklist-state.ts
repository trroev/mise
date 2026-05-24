"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export const UNIT_SYSTEMS = ["us", "metric"] as const satisfies ReadonlyArray<
  "us" | "metric"
>
export type UnitSystem = (typeof UNIT_SYSTEMS)[number]

export type ChecklistStorageKey = `checklist:${string}:${number}:${UnitSystem}`

export type UseChecklistStateOptions = {
  storageKey: ChecklistStorageKey
  initial?: ReadonlyArray<string>
}

export type UseChecklistStateResult = {
  checked: ReadonlySet<string>
  toggle: (id: string) => void
  reset: () => void
}

const readStored = (key: string): Array<string> | null => {
  if (typeof window === "undefined") {
    return null
  }
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) {
      return null
    }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return null
    }
    return parsed.filter((v): v is string => typeof v === "string")
  } catch {
    return null
  }
}

export const useChecklistState = ({
  storageKey,
  initial,
}: UseChecklistStateOptions): UseChecklistStateResult => {
  const [checked, setChecked] = useState<ReadonlySet<string>>(() => {
    const stored = readStored(storageKey)
    if (stored) {
      return new Set(stored)
    }
    return new Set(initial ?? [])
  })

  // Re-hydrate when the storage key changes (e.g. yield / units toggled).
  const lastKeyRef = useRef(storageKey)
  useEffect(() => {
    if (lastKeyRef.current === storageKey) {
      return
    }
    lastKeyRef.current = storageKey
    const stored = readStored(storageKey)
    setChecked(new Set(stored ?? []))
  }, [storageKey])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }
    try {
      if (checked.size === 0) {
        window.localStorage.removeItem(storageKey)
        return
      }
      window.localStorage.setItem(
        storageKey,
        JSON.stringify(Array.from(checked))
      )
    } catch {
      // Ignore quota / privacy-mode failures.
    }
  }, [checked, storageKey])

  const toggle = useCallback((id: string): void => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const reset = useCallback((): void => {
    setChecked(new Set())
  }, [])

  return { checked, toggle, reset }
}
