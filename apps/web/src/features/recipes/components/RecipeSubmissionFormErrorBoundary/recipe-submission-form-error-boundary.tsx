import type { ReactNode } from "react"
import { ErrorBoundary } from "~/components/ErrorBoundary"

type RecipeSubmissionFormErrorBoundaryProps = {
  readonly children: ReactNode
}

export const RecipeSubmissionFormErrorBoundary = ({
  children,
}: RecipeSubmissionFormErrorBoundaryProps): ReactNode => (
  <ErrorBoundary
    description="We couldn't load the submission form. Try again in a moment."
    feature="recipes:submission-form"
    title="Couldn't load the submission form"
  >
    {children}
  </ErrorBoundary>
)
