"use client"

import { RouteErrorFallback } from "~/components/RouteErrorFallback"

export default function RecipeDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RouteErrorFallback
      description="We couldn't load this recipe. Please try again in a moment."
      error={error}
      reset={reset}
      title="Recipe unavailable"
    />
  )
}
