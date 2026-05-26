"use client"

import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import { savedRecipesQueryKeys } from "../saved-recipes-query-keys"

const fetchSavedRecipeIds = async (): Promise<ReadonlyArray<string>> => {
  const response = await fetch("/api/saved-recipes/ids", {
    headers: { accept: "application/json" },
  })
  if (!response.ok) {
    throw new Error("Failed to load saved recipes")
  }
  return (await response.json()) as ReadonlyArray<string>
}

export const useSavedRecipeIds = (): UseQueryResult<
  ReadonlyArray<string>,
  Error
> =>
  useQuery({
    queryKey: savedRecipesQueryKeys.ids,
    queryFn: fetchSavedRecipeIds,
  })
