"use client"

import { RouteErrorFallback } from "~/components/RouteErrorFallback"

export default function RecipesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RouteErrorFallback
      description="We couldn't load the recipe collection. Please try again in a moment."
      error={error}
      reset={reset}
      title="Recipes unavailable"
    />
  )
}
