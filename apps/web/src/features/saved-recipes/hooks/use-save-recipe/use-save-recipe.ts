"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import { match } from "ts-pattern"
import { saveRecipe } from "~/features/saved-recipes/actions/save-recipe"
import { unsaveRecipe } from "~/features/saved-recipes/actions/unsave-recipe"
import { savedRecipesQueryKeys } from "../saved-recipes-query-keys"
import { useSavedRecipeIds } from "../use-saved-recipe-ids"

type UseSaveRecipeInput = {
  recipeId: string
}

type UseSaveRecipeReturn = {
  toggle: () => void
  isSaved: boolean
  isPending: boolean
  error: Error | null
}

type ToggleVariables = {
  nextSaved: boolean
}

type ToggleContext = {
  previous: ReadonlyArray<string> | undefined
}

export const useSaveRecipe = ({
  recipeId,
}: UseSaveRecipeInput): UseSaveRecipeReturn => {
  const queryClient = useQueryClient()
  const { data: ids } = useSavedRecipeIds()
  const [error, setError] = useState<Error | null>(null)

  const isSaved = ids?.includes(recipeId) ?? false

  const mutation = useMutation<unknown, Error, ToggleVariables, ToggleContext>({
    mutationFn: async ({ nextSaved }) => {
      const result = nextSaved
        ? await saveRecipe({ recipeId })
        : await unsaveRecipe({ recipeId })
      return match(result)
        .with({ status: "ok" }, ({ data }) => data)
        .with({ status: "unauthenticated" }, () => {
          throw new Error("You must be signed in to save recipes.")
        })
        .with({ status: "error" }, ({ message }) => {
          throw new Error(message)
        })
        .exhaustive()
    },
    onMutate: async ({ nextSaved }) => {
      await queryClient.cancelQueries({ queryKey: savedRecipesQueryKeys.ids })
      const previous = queryClient.getQueryData<ReadonlyArray<string>>(
        savedRecipesQueryKeys.ids
      )
      const current = previous ?? []
      const optimistic = nextSaved
        ? Array.from(new Set([...current, recipeId]))
        : current.filter((id) => id !== recipeId)
      queryClient.setQueryData<ReadonlyArray<string>>(
        savedRecipesQueryKeys.ids,
        optimistic
      )
      setError(null)
      return { previous }
    },
    onError: (mutationError, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData<ReadonlyArray<string>>(
          savedRecipesQueryKeys.ids,
          context.previous
        )
      }
      setError(mutationError)
      toast.error(mutationError.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: savedRecipesQueryKeys.ids })
    },
  })

  const toggle = (): void => {
    mutation.mutate({ nextSaved: !isSaved })
  }

  return {
    toggle,
    isSaved,
    isPending: mutation.isPending,
    error,
  }
}
