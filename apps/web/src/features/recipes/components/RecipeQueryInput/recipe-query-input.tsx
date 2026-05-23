"use client"

import { Badge } from "@mise/ui/components/Badge"
import { Input } from "@mise/ui/components/Input"
import { RiCloseLine, RiFilter3Line, RiSearchLine } from "@remixicon/react"
import { useRecipeSearch } from "~/features/recipes/components/RecipeSearchProvider"

export const RecipeQueryInput = () => {
  const { query, setQuery, filters, openFilters } = useRecipeSearch()
  const activeCount = filters.activeFilterCount

  return (
    <div className="flex items-center gap-3">
      <div className="relative max-w-sm flex-1">
        <RiSearchLine
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted"
          size={18}
        />
        <Input
          aria-label="Search recipes"
          className="pr-10 pl-10"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search recipes…"
          type="search"
          value={query}
        />
        {query && (
          <button
            aria-label="Clear search"
            className="absolute top-1/2 right-3 -translate-y-1/2 text-text-muted hover:text-text-primary"
            onClick={() => setQuery("")}
            type="button"
          >
            <RiCloseLine aria-hidden="true" size={18} />
          </button>
        )}
      </div>

      <button
        aria-expanded={false}
        aria-label={`Filters${activeCount > 0 ? `, ${activeCount} active` : ""}`}
        className="relative inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 font-sans text-body text-text-primary hover:bg-background lg:hidden"
        onClick={openFilters}
        type="button"
      >
        <RiFilter3Line aria-hidden="true" size={16} />
        Filters
        {activeCount > 0 && (
          <Badge className="min-w-5 text-center">{activeCount}</Badge>
        )}
      </button>
    </div>
  )
}
