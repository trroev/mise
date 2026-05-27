import type { ReactNode } from "react"
import { ErrorBoundary } from "~/components/ErrorBoundary"

type RecipeResultGridErrorBoundaryProps = {
  readonly children: ReactNode
}

export const RecipeResultGridErrorBoundary = ({
  children,
}: RecipeResultGridErrorBoundaryProps): ReactNode => (
  <ErrorBoundary
    description="We couldn't load these recipes. Try again in a moment."
    feature="recipes:result-grid"
    title="Couldn't load recipes"
  >
    {children}
  </ErrorBoundary>
)
