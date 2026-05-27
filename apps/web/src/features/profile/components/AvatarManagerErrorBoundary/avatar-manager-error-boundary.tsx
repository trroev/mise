import type { ReactNode } from "react"
import { ErrorBoundary } from "~/components/ErrorBoundary"

type AvatarManagerErrorBoundaryProps = {
  readonly children: ReactNode
}

export const AvatarManagerErrorBoundary = ({
  children,
}: AvatarManagerErrorBoundaryProps): ReactNode => (
  <ErrorBoundary
    description="We couldn't load your avatar settings. Try again in a moment."
    feature="profile:avatar-manager"
    title="Couldn't load avatar settings"
  >
    {children}
  </ErrorBoundary>
)
