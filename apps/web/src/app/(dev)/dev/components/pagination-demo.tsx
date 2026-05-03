"use client"

import { Pagination } from "@mise/ui/components/Pagination"
import { useState } from "react"

export const PaginationDemo = ({ pages }: { pages: number }) => {
  const [page, setPage] = useState(Math.ceil(pages / 2))

  return (
    <div className="space-y-4">
      <Pagination
        currentPage={1}
        onPageChange={() => undefined}
        totalPages={pages}
      />
      <Pagination
        currentPage={page}
        onPageChange={setPage}
        totalPages={pages}
      />
      <Pagination
        currentPage={pages}
        onPageChange={() => undefined}
        totalPages={pages}
      />
    </div>
  )
}
