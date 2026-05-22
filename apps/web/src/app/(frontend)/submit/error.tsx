"use client"

import { RouteErrorFallback } from "~/components/RouteErrorFallback"

export default function SubmitError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RouteErrorFallback
      description="We couldn't load the submission form. Your in-progress work may not be saved — please try again."
      error={error}
      reset={reset}
      title="Submission unavailable"
    />
  )
}
