import { cn } from "@mise/ui/utils/cn"
import Link from "next/link"
import type React from "react"

export type CardProps = {
  href: string
  media?: React.ReactNode
  badges?: React.ReactNode
  body: React.ReactNode
  className?: string
}

export const Card = ({ href, media, badges, body, className }: CardProps) => (
  <Link
    className={cn(
      "group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      className
    )}
    href={href}
  >
    <div className="relative aspect-4/3 w-full overflow-hidden rounded-md bg-surface">
      {media}
    </div>
    {badges && (
      <div className="mt-3 flex flex-wrap items-center gap-2">{badges}</div>
    )}
    <div className="mt-3">{body}</div>
  </Link>
)
