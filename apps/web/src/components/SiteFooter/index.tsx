import type React from "react"

export type SiteFooterProps = {
  className?: string
}

export const SiteFooter = ({
  className,
}: SiteFooterProps): React.JSX.Element => (
  <footer className={className}>
    <div className="mx-auto max-w-7xl border-border border-t px-4 py-6 text-center">
      <p className="text-caption text-text-muted">
        &copy; {new Date().getFullYear()} Mise
      </p>
    </div>
  </footer>
)
