import type { ReactNode } from "react"
import { ErrorBoundary } from "~/components/ErrorBoundary"

type VerifyEmailErrorBoundaryProps = {
  readonly children: ReactNode
}

export const VerifyEmailErrorBoundary = ({
  children,
}: VerifyEmailErrorBoundaryProps): ReactNode => (
  <ErrorBoundary
    description="We couldn't load the email verification status. Try again in a moment."
    feature="auth:verify-email"
    title="Couldn't load verification status"
  >
    {children}
  </ErrorBoundary>
)
