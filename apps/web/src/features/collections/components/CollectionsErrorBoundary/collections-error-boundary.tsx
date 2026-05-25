"use client"

import { Button } from "@mise/ui/components/Button"
import { Component, type ErrorInfo, type ReactNode } from "react"

type CollectionsErrorBoundaryProps = {
  children: ReactNode
}

type CollectionsErrorBoundaryState = {
  error: Error | null
}

export class CollectionsErrorBoundary extends Component<
  CollectionsErrorBoundaryProps,
  CollectionsErrorBoundaryState
> {
  state: CollectionsErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): CollectionsErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error("CollectionsErrorBoundary:", error, info)
  }

  handleReset = (): void => {
    this.setState({ error: null })
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div
          aria-live="polite"
          className="rounded-lg border border-destructive/40 bg-destructive/5 p-4"
          role="alert"
        >
          <p className="font-sans text-body text-text-primary">
            Something went wrong loading your collections.
          </p>
          <Button
            className="mt-3"
            onClick={this.handleReset}
            type="button"
            variant="ghost"
          >
            Try again
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
