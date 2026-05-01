"use client"

import type { Recipe } from "@mise/payload/payload-types"
import { Button } from "@mise/ui/components/Button"
import { Input } from "@mise/ui/components/Input"
import { RecipeCard } from "@mise/ui/components/RecipeCard"
import { RiCloseLine, RiSearchLine } from "@remixicon/react"
import { useQuery } from "@tanstack/react-query"
import MiniSearch from "minisearch"
import { useMemo, useState } from "react"
import { match } from "ts-pattern"
import {
  fetchPublishedRecipes,
  publishedRecipesQueryKey,
} from "~/lib/queries/published-recipes"

export const RecipeSearch = () => {
  const [query, setQuery] = useState("")
  const { data: recipes = [] } = useQuery({
    queryKey: publishedRecipesQueryKey,
    queryFn: fetchPublishedRecipes,
    staleTime: 60_000,
  })

  const recipeById = useMemo(
    () => new Map(recipes.map((recipe) => [recipe.id, recipe])),
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
      recipes.map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description ?? "",
      }))
    )
    return instance
  }, [recipes])

  const trimmed = query.trim()
  const results: Array<Recipe> = trimmed
    ? miniSearch
        .search(trimmed)
        .map(({ id }) => recipeById.get(id as string))
        .filter((recipe): recipe is Recipe => recipe !== undefined)
    : recipes

  const isSearching = trimmed.length > 0
  const view = match({
    isSearching,
    resultsCount: results.length,
    recipesCount: recipes.length,
  })
    .with({ isSearching: false, recipesCount: 0 }, () => "empty" as const)
    .with({ isSearching: true, resultsCount: 0 }, () => "no-results" as const)
    .otherwise(() => "grid" as const)

  return (
    <div className="flex flex-col space-y-8">
      <div className="relative">
        <RiSearchLine
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted"
          size={18}
        />
        <Input
          aria-label="Search recipes"
          className="pr-10 pl-10"
          onChange={(event) => setQuery(event.target.value)}
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
      {match(view)
        .with("empty", () => (
          <p className="font-sans text-body-md text-text-secondary">
            No recipes yet — check back soon.
          </p>
        ))
        .with("no-results", () => (
          <div className="flex flex-col items-start space-y-4">
            <p className="font-sans text-body-md text-text-secondary">
              No recipes match “{trimmed}”. Try a different search.
            </p>
            <Button
              onClick={() => setQuery("")}
              type="button"
              variant="outline"
            >
              Clear search
            </Button>
          </div>
        ))
        .with("grid", () => (
          <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {results.map((recipe) => (
              <li key={recipe.id}>
                <RecipeCard recipe={recipe} />
              </li>
            ))}
          </ul>
        ))
        .exhaustive()}
    </div>
  )
}
