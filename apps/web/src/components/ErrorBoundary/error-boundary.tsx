"use client"

import { captureException } from "@sentry/nextjs"
import { Component, type ErrorInfo, type ReactNode } from "react"
import { WidgetErrorFallback } from "~/components/WidgetErrorFallback"

type ErrorBoundaryProps = {
  readonly feature: string
  readonly children: ReactNode
  readonly title?: string
  readonly description?: string
}

type ErrorBoundaryState = {
  readonly error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    captureException(error, {
      tags: { feature: this.props.feature },
      contexts: { react: { componentStack: info.componentStack } },
    })
  }

  handleReset = (): void => {
    this.setState({ error: null })
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <WidgetErrorFallback
          description={this.props.description}
          resetErrorBoundary={this.handleReset}
          title={this.props.title}
        />
      )
    }
    return this.props.children
  }
}
