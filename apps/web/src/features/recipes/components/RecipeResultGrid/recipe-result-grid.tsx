"use client"

import { Button } from "@mise/ui/components/Button"
import type { ComponentType } from "react"
import { match } from "ts-pattern"
import { RecipeCard } from "~/features/recipes/components/RecipeCard"
import { useRecipeSearch } from "~/features/recipes/components/RecipeSearchProvider"

type RecipeResultGridProps = {
  ActionsComponent?: ComponentType<{ recipeId: string }>
}

export const RecipeResultGrid = ({
  ActionsComponent,
}: RecipeResultGridProps) => {
  const {
    view,
    pagedResults,
    totalResults,
    rangeStart,
    rangeEnd,
    noResultsMessage,
    isSearching,
    hasActiveFilters,
    setQuery,
    filters,
  } = useRecipeSearch()

  return (
    <>
      {view === "grid" && (
        <p className="font-sans text-body-sm text-text-secondary">
          Showing {rangeStart}–{rangeEnd} of {totalResults}{" "}
          {totalResults === 1 ? "recipe" : "recipes"}
        </p>
      )}

      {match(view)
        .with("empty", () => (
          <p className="font-sans text-body-md text-text-secondary">
            No recipes yet — check back soon.
          </p>
        ))
        .with("no-results", () => (
          <div className="flex flex-col items-start gap-4">
            <p className="font-sans text-body-md text-text-secondary">
              {noResultsMessage}
            </p>
            <div className="flex gap-2">
              {isSearching && (
                <Button
                  onClick={() => setQuery("")}
                  type="button"
                  variant="outline"
                >
                  Clear search
                </Button>
              )}
              {hasActiveFilters && (
                <Button
                  onClick={filters.clearAllFilters}
                  type="button"
                  variant="outline"
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        ))
        .with("grid", () => (
          <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {pagedResults.map((recipe) => (
              <li key={recipe.id}>
                <RecipeCard
                  actions={
                    ActionsComponent ? (
                      <ActionsComponent recipeId={recipe.id} />
                    ) : undefined
                  }
                  recipe={recipe}
                />
              </li>
            ))}
          </ul>
        ))
        .exhaustive()}
    </>
  )
}
