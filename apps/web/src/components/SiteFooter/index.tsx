import { cn } from "@mise/ui/utils/cn"
import type React from "react"

export type SiteFooterProps = {
  className?: string
}

export const SiteFooter = ({
  className,
}: SiteFooterProps): React.JSX.Element => (
  <footer className={cn("border-border border-t", className)}>
    <div className="constrainer py-6 text-center">
      <p className="text-caption text-text-muted">
        &copy; {new Date().getFullYear()} Mise
      </p>
    </div>
  </footer>
)
