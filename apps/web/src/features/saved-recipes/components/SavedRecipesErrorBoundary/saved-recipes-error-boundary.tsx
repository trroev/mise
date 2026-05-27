import type { ReactNode } from "react"
import { ErrorBoundary } from "~/components/ErrorBoundary"

type SavedRecipesErrorBoundaryProps = {
  readonly children: ReactNode
}

export const SavedRecipesErrorBoundary = ({
  children,
}: SavedRecipesErrorBoundaryProps): ReactNode => (
  <ErrorBoundary
    description="We couldn't load your saved recipes. Try again in a moment."
    feature="saved-recipes"
    title="Couldn't load saved recipes"
  >
    {children}
  </ErrorBoundary>
)
