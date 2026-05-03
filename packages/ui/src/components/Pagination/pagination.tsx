"use client"

import { Button } from "@mise/ui/components/Button"
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react"

export type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const getPageItems = (
  current: number,
  total: number
): Array<number | "ellipsis"> => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const items: Array<number | "ellipsis"> = [1]
  const rangeStart = Math.max(2, current - 1)
  const rangeEnd = Math.min(total - 1, current + 1)

  if (rangeStart > 2) {
    items.push("ellipsis")
  }

  for (let i = rangeStart; i <= rangeEnd; i++) {
    items.push(i)
  }

  if (rangeEnd < total - 1) {
    items.push("ellipsis")
  }

  items.push(total)

  return items
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  const pages = getPageItems(currentPage, totalPages)

  return (
    <nav aria-label="pagination" className="flex w-full justify-center">
      <ul className="flex flex-row items-center gap-1">
        <li>
          <Button
            aria-label="Go to previous page"
            className="gap-1.5"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            size="sm"
            variant="ghost"
          >
            <RiArrowLeftSLine aria-hidden="true" size={16} />
            Previous
          </Button>
        </li>

        {pages.map((page, index) =>
          page === "ellipsis" ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: ellipsis items have no stable identity
            <li key={`ellipsis-${index}`}>
              <span
                aria-hidden="true"
                className="flex size-10 items-center justify-center font-sans text-body text-text-muted"
              >
                …
              </span>
            </li>
          ) : (
            <li key={page}>
              <Button
                aria-current={page === currentPage ? "page" : undefined}
                aria-label={`Go to page ${page}`}
                onClick={() => onPageChange(page)}
                size="icon"
                variant={page === currentPage ? "primary" : "ghost"}
              >
                {page}
              </Button>
            </li>
          )
        )}

        <li>
          <Button
            aria-label="Go to next page"
            className="gap-1.5"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            size="sm"
            variant="ghost"
          >
            Next
            <RiArrowRightSLine aria-hidden="true" size={16} />
          </Button>
        </li>
      </ul>
    </nav>
  )
}
