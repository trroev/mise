"use client"

import { cn } from "@mise/ui/utils/cn"
import { RiCloseLine } from "@remixicon/react"
import type { ReactNode } from "react"
import { useRecipeSearch } from "~/features/recipes/components/RecipeSearchProvider"

type RecipeMobileFilterDrawerProps = {
  children: ReactNode
}

export const RecipeMobileFilterDrawer = ({
  children,
}: RecipeMobileFilterDrawerProps) => {
  const { isFiltersOpen, closeFilters } = useRecipeSearch()

  return (
    <>
      <div
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-50 bg-black/50 lg:hidden",
          "transition-opacity duration-300",
          isFiltersOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={closeFilters}
      />
      <div
        aria-hidden={!isFiltersOpen}
        aria-label="Filters"
        aria-modal={isFiltersOpen}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-xl bg-surface p-6 shadow-xl lg:hidden",
          "transition-transform duration-300",
          isFiltersOpen ? "translate-y-0" : "translate-y-full"
        )}
        role="dialog"
      >
        <div className="flex justify-end pb-2">
          <button
            aria-label="Close filters"
            className="text-text-muted hover:text-text-primary"
            onClick={closeFilters}
            type="button"
          >
            <RiCloseLine aria-hidden="true" size={20} />
          </button>
        </div>
        {children}
      </div>
    </>
  )
}
