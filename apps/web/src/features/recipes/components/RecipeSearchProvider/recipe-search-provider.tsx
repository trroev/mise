"use client"

import type { Recipe } from "@mise/payload/payload-types"
import { captureException } from "@sentry/nextjs"
import MiniSearch from "minisearch"
import { useSearchParams } from "next/navigation"
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { ErrorBoundary } from "react-error-boundary"
import { match } from "ts-pattern"
import { WidgetErrorFallback } from "~/components/WidgetErrorFallback"
import { applyFacetFilters, getNoResultsMessage } from "./recipe-search.helpers"
import {
  type UseRecipeFiltersReturn,
  useRecipeFilters,
} from "./use-recipe-filters"

const PAGE_SIZE = 12

type RecipeSearchView = "empty" | "no-results" | "grid"

type RecipeSearchContextValue = {
  query: string
  setQuery: (value: string) => void
  filters: UseRecipeFiltersReturn
  results: ReadonlyArray<Recipe>
  pagedResults: ReadonlyArray<Recipe>
  totalPages: number
  currentPage: number
  rangeStart: number
  rangeEnd: number
  totalResults: number
  view: RecipeSearchView
  isSearching: boolean
  hasActiveFilters: boolean
  noResultsMessage: string
  isFiltersOpen: boolean
  openFilters: VoidFunction
  closeFilters: VoidFunction
}

const RecipeSearchContext = createContext<RecipeSearchContextValue | null>(null)

export const useRecipeSearch = (): RecipeSearchContextValue => {
  const ctx = useContext(RecipeSearchContext)
  if (!ctx) {
    throw new Error(
      "useRecipeSearch must be used inside <RecipeSearchProvider>"
    )
  }
  return ctx
}

type RecipeSearchProviderProps = {
  recipes: Array<Recipe>
  children: ReactNode
}

const RecipeSearchProviderInner = ({
  recipes,
  children,
}: RecipeSearchProviderProps) => {
  const searchParams = useSearchParams()
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [query, setQuery] = useState(searchParams.get("q") ?? "")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const trimmed = query.trim()

  const searchResults = useMemo((): Array<Recipe> => {
    if (!trimmed) {
      return recipes
    }
    return miniSearch
      .search(trimmed)
      .map(({ id }) => recipeById.get(id as string))
      .filter((r): r is Recipe => r !== undefined)
  }, [trimmed, miniSearch, recipeById, recipes])

  const results = useMemo(
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

  const totalPages = Math.ceil(results.length / PAGE_SIZE)
  const currentPage = Math.min(filters.currentPage, Math.max(1, totalPages))
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const pageEnd = pageStart + PAGE_SIZE
  const pagedResults = results.slice(pageStart, pageEnd)
  const rangeStart = results.length === 0 ? 0 : pageStart + 1
  const rangeEnd = Math.min(pageEnd, results.length)

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

  const view = match({
    hasRecipes: recipes.length > 0,
    hasResults: results.length > 0,
  })
    .returnType<RecipeSearchView>()
    .with({ hasRecipes: false }, () => "empty")
    .with({ hasResults: false }, () => "no-results")
    .otherwise(() => "grid")

  const value: RecipeSearchContextValue = {
    query,
    setQuery,
    filters,
    results,
    pagedResults,
    totalPages,
    currentPage,
    rangeStart,
    rangeEnd,
    totalResults: results.length,
    view,
    isSearching,
    hasActiveFilters,
    noResultsMessage: getNoResultsMessage(
      trimmed,
      isSearching,
      hasActiveFilters
    ),
    isFiltersOpen,
    openFilters: () => setIsFiltersOpen(true),
    closeFilters: () => setIsFiltersOpen(false),
  }

  return (
    <RecipeSearchContext.Provider value={value}>
      {children}
    </RecipeSearchContext.Provider>
  )
}

export const RecipeSearchProvider = (props: RecipeSearchProviderProps) => (
  <ErrorBoundary
    fallbackRender={({ resetErrorBoundary }) => (
      <WidgetErrorFallback
        description="We couldn't load the recipe search. The rest of the page should still work."
        resetErrorBoundary={resetErrorBoundary}
        title="Couldn't load recipe search"
      />
    )}
    onError={(error) => captureException(error)}
  >
    <RecipeSearchProviderInner {...props} />
  </ErrorBoundary>
)
