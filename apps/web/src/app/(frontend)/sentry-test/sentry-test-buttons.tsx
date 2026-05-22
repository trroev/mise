"use client"

import { Button } from "@mise/ui/components/Button"

const triggerClientError = (): void => {
  throw new Error("Sentry test: deliberate client error")
}

const triggerServerError = (): void => {
  window.location.assign("/sentry-test?throw=server")
}

export const SentryTestButtons = () => (
  <div className="flex flex-wrap gap-3">
    <Button onClick={triggerClientError}>Throw client error</Button>
    <Button onClick={triggerServerError}>Throw server error</Button>
  </div>
)
