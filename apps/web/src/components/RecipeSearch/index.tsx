"use client"

import { RecipeCard } from "@mise/features/components/RecipeCard"
import type { Recipe } from "@mise/payload/payload-types"
import { Badge } from "@mise/ui/components/Badge"
import { Button } from "@mise/ui/components/Button"
import { Input } from "@mise/ui/components/Input"
import { Pagination } from "@mise/ui/components/Pagination"
import { cn } from "@mise/ui/utils/cn"
import { RiCloseLine, RiFilter3Line, RiSearchLine } from "@remixicon/react"
import MiniSearch from "minisearch"
import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { match } from "ts-pattern"
import { RecipeFilterPanel } from "~/components/RecipeFilterPanel"
import { applyFacetFilters, getNoResultsMessage } from "./recipe-search.helpers"
import { useRecipeFilters } from "./use-recipe-filters"

const PAGE_SIZE = 12

export type RecipeSearchProps = {
  recipes: Array<Recipe>
}

export const RecipeSearch = ({
  recipes: initialRecipes,
}: RecipeSearchProps) => {
  const searchParams = useSearchParams()
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [localQuery, setLocalQuery] = useState(searchParams.get("q") ?? "")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const recipes = initialRecipes

  const filters = useRecipeFilters(recipes)

  const recipeById = useMemo(
    () => new Map(recipes.map((r) => [r.id, r])),
    [recipes]
  )

  const miniSearch = useMemo(() => {
    const instance = new MiniSearch<{
      id: string
      title: string
      description: string
    }>({
      fields: ["title", "description"],
      storeFields: ["id"],
      searchOptions: { fuzzy: 0.2, prefix: true },
    })
    instance.addAll(
      recipes.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description ?? "",
      }))
    )
    return instance
  }, [recipes])

  const trimmed = localQuery.trim()

  const searchResults = useMemo((): Array<Recipe> => {
    if (!trimmed) {
      return recipes
    }
    return miniSearch
      .search(trimmed)
      .map(({ id }) => recipeById.get(id as string))
      .filter((r): r is Recipe => r !== undefined)
  }, [trimmed, miniSearch, recipeById, recipes])

  const filteredResults = useMemo(
    () =>
      applyFacetFilters(
        searchResults,
        filters.courseFilter,
        filters.cuisineFilter,
        filters.difficultyFilter,
        filters.tagsFilter,
        filters.timeRangeFilter
      ),
    [searchResults, filters]
  )

  const totalPages = Math.ceil(filteredResults.length / PAGE_SIZE)
  const currentPage = Math.min(filters.currentPage, Math.max(1, totalPages))
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const pageEnd = pageStart + PAGE_SIZE
  const pagedResults = filteredResults.slice(pageStart, pageEnd)

  const rangeStart = filteredResults.length === 0 ? 0 : pageStart + 1
  const rangeEnd = Math.min(pageEnd, filteredResults.length)

  // Debounce search query → URL sync
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      const currentQ = searchParams.get("q") ?? ""
      if (trimmed === currentQ) {
        return
      }
      filters.updateFilterParam("q", trimmed || null)
    }, 300)
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [trimmed, searchParams, filters])

  // Close mobile drawer on Escape
  useEffect(() => {
    if (!isFiltersOpen) {
      return
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFiltersOpen(false)
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isFiltersOpen])

  const isSearching = trimmed.length > 0
  const hasActiveFilters = filters.activeFilterCount > 0

  const filterPanelProps = {
    courseFilter: filters.courseFilter,
    cuisineFilter: filters.cuisineFilter,
    difficultyFilter: filters.difficultyFilter,
    tagsFilter: filters.tagsFilter,
    courseOptions: filters.courseOptions,
    cuisineOptions: filters.cuisineOptions,
    difficultyOptions: filters.difficultyOptions,
    dietaryTagOptions: filters.dietaryTagOptions,
    onCourseChange: (value: string) =>
      filters.updateFilterParam("course", value || null),
    onCuisineChange: (value: string) =>
      filters.updateFilterParam("cuisine", value || null),
    onDifficultyChange: (value: string) =>
      filters.updateFilterParam("difficulty", value || null),
    onTagToggle: (tag: string) => {
      const newTags = filters.tagsFilter.includes(tag)
        ? filters.tagsFilter.filter((t) => t !== tag)
        : [...filters.tagsFilter, tag]
      filters.updateFilterParam(
        "tags",
        newTags.length > 0 ? newTags.join(",") : null
      )
    },
    timeRangeFilter: filters.timeRangeFilter,
    onTimeRangeChange: (value: string) =>
      filters.updateFilterParam("time", value || null),
    onClearAll: filters.clearAllFilters,
    activeCount: filters.activeFilterCount,
  }

  const view = match({
    hasRecipes: recipes.length > 0,
    hasResults: filteredResults.length > 0,
  })
    .with({ hasRecipes: false }, () => "empty" as const)
    .with({ hasResults: false }, () => "no-results" as const)
    .otherwise(() => "grid" as const)

  return (
    <div className="flex flex-col gap-8">
      {/* Search bar + mobile filter toggle */}
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
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search recipes…"
            type="search"
            value={localQuery}
          />
          {localQuery && (
            <button
              aria-label="Clear search"
              className="absolute top-1/2 right-3 -translate-y-1/2 text-text-muted hover:text-text-primary"
              onClick={() => setLocalQuery("")}
              type="button"
            >
              <RiCloseLine aria-hidden="true" size={18} />
            </button>
          )}
        </div>

        <button
          aria-expanded={isFiltersOpen}
          aria-label={`Filters${filters.activeFilterCount > 0 ? `, ${filters.activeFilterCount} active` : ""}`}
          className="relative inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 font-sans text-body text-text-primary hover:bg-background lg:hidden"
          onClick={() => setIsFiltersOpen(true)}
          type="button"
        >
          <RiFilter3Line aria-hidden="true" size={16} />
          Filters
          {filters.activeFilterCount > 0 && (
            <Badge className="min-w-5 text-center">
              {filters.activeFilterCount}
            </Badge>
          )}
        </button>
      </div>

      {/* Desktop sidebar + results */}
      <div className="flex items-start gap-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <RecipeFilterPanel {...filterPanelProps} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {view === "grid" && (
            <p className="font-sans text-body-sm text-text-secondary">
              Showing {rangeStart}–{rangeEnd} of {filteredResults.length}{" "}
              {filteredResults.length === 1 ? "recipe" : "recipes"}
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
                  {getNoResultsMessage(trimmed, isSearching, hasActiveFilters)}
                </p>
                <div className="flex gap-2">
                  {isSearching && (
                    <Button
                      onClick={() => setLocalQuery("")}
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
                    <RecipeCard recipe={recipe} />
                  </li>
                ))}
              </ul>
            ))
            .exhaustive()}

          {view === "grid" && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              onPageChange={filters.goToPage}
              totalPages={totalPages}
            />
          )}
        </div>
      </div>

      {/* Mobile filter drawer backdrop */}
      <div
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-50 bg-black/50 lg:hidden",
          "transition-opacity duration-300",
          isFiltersOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setIsFiltersOpen(false)}
      />

      {/* Mobile filter drawer panel */}
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
        <RecipeFilterPanel
          {...filterPanelProps}
          headerAction={
            <button
              aria-label="Close filters"
              className="text-text-muted hover:text-text-primary"
              onClick={() => setIsFiltersOpen(false)}
              type="button"
            >
              <RiCloseLine aria-hidden="true" size={20} />
            </button>
          }
        />
      </div>
    </div>
  )
}
