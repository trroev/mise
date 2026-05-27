import type { ReactNode } from "react"
import { ErrorBoundary } from "~/components/ErrorBoundary"

type CollectionsErrorBoundaryProps = {
  readonly children: ReactNode
}

export const CollectionsErrorBoundary = ({
  children,
}: CollectionsErrorBoundaryProps): ReactNode => (
  <ErrorBoundary
    description="We couldn't load your collections. Try again in a moment."
    feature="collections"
    title="Couldn't load collections"
  >
    {children}
  </ErrorBoundary>
)
