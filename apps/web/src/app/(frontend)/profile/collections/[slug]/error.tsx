"use client"

import { RouteErrorFallback } from "~/components/RouteErrorFallback"

export default function CollectionDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RouteErrorFallback
      description="We couldn't load this collection. Please try again in a moment."
      error={error}
      reset={reset}
      title="Collection unavailable"
    />
  )
}
