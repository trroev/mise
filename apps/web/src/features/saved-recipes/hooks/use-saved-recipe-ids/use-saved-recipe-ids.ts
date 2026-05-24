"use client"

import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import { match } from "ts-pattern"
import { listSavedRecipes } from "~/features/saved-recipes/actions/list-saved-recipes"
import { savedRecipesQueryKeys } from "../saved-recipes-query-keys"

const fetchSavedRecipeIds = async (): Promise<ReadonlyArray<string>> => {
  const result = await listSavedRecipes()
  return match(result)
    .with({ status: "ok" }, ({ data }) =>
      data.map((doc) =>
        typeof doc.recipe === "string" ? doc.recipe : String(doc.recipe.id)
      )
    )
    .with({ status: "unauthenticated" }, () => [])
    .with({ status: "error" }, () => [])
    .exhaustive()
}

export const useSavedRecipeIds = (): UseQueryResult<
  ReadonlyArray<string>,
  Error
> =>
  useQuery({
    queryKey: savedRecipesQueryKeys.ids,
    queryFn: fetchSavedRecipeIds,
  })
