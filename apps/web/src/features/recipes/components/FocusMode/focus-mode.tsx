"use client"

import { Button } from "@mise/ui/components/Button"
import { RiFullscreenExitLine, RiFullscreenLine } from "@remixicon/react"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { useWakeLock } from "../../hooks/use-wake-lock"

export type FocusModeProps = {
  ingredients: React.ReactNode
  instructions: React.ReactNode
  children: React.ReactNode
}

const swallow = (): void => {
  // Promise rejections from wake-lock side effects are handled internally.
}

export const FocusMode = ({
  ingredients,
  instructions,
  children,
}: FocusModeProps) => {
  const [isEnabled, setIsEnabled] = useState(false)
  const { request, release } = useWakeLock()
  const pathname = usePathname()

  const toggle = useCallback((): void => {
    setIsEnabled((prev) => !prev)
  }, [])

  useEffect(() => {
    if (!isEnabled) {
      return
    }

    document.body.dataset.focusMode = "true"
    request().catch(swallow)

    const onVisibilityChange = (): void => {
      if (document.visibilityState === "visible") {
        request().catch(swallow)
      } else {
        release().catch(swallow)
      }
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setIsEnabled(false)
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange)
    document.addEventListener("keydown", onKeyDown)

    return () => {
      delete document.body.dataset.focusMode
      release().catch(swallow)
      document.removeEventListener("visibilitychange", onVisibilityChange)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [isEnabled, request, release])

  // Route change exits focus mode. Reading pathname tracks navigations.
  useEffect(() => {
    if (pathname) {
      setIsEnabled(false)
    }
  }, [pathname])

  return (
    <>
      <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6 print:hidden">
        <Button
          aria-label={isEnabled ? "Exit focus mode" : "Enter focus mode"}
          aria-pressed={isEnabled}
          className="shadow-lg"
          onClick={toggle}
          size="sm"
          type="button"
          variant="primary"
        >
          {isEnabled ? (
            <RiFullscreenExitLine aria-hidden="true" size={16} />
          ) : (
            <RiFullscreenLine aria-hidden="true" size={16} />
          )}
          <span className="ml-2">
            {isEnabled ? "Exit focus" : "Focus mode"}
          </span>
        </Button>
      </div>

      {isEnabled ? (
        <div className="constrainer space-y-12 py-12 text-body-lg">
          <div className="grid gap-12 lg:grid-cols-[2fr_3fr]">
            <div>{ingredients}</div>
            <div>{instructions}</div>
          </div>
        </div>
      ) : (
        children
      )}
    </>
  )
}
