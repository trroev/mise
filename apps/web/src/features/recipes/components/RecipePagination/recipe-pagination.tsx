"use client"

import { Pagination } from "@mise/ui/components/Pagination"
import { useRecipeSearch } from "~/features/recipes/components/RecipeSearchProvider"

export const RecipePagination = () => {
  const { view, currentPage, totalPages, filters } = useRecipeSearch()

  if (view !== "grid" || totalPages <= 1) {
    return null
  }

  return (
    <Pagination
      currentPage={currentPage}
      onPageChange={filters.goToPage}
      totalPages={totalPages}
    />
  )
}
