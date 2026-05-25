"use client"

import type { Collection } from "@mise/payload/payload-types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { match } from "ts-pattern"
import { addRecipeToCollection } from "~/features/collections/actions/add-recipe-to-collection"
import { collectionsQueryKeys } from "../collections-query-keys"

type AddRecipeToCollectionVariables = {
  collectionId: string
  recipeId: string
}

type AddContext = {
  previous: ReadonlyArray<Collection> | undefined
}

type UseAddRecipeToCollectionReturn = {
  mutate: (variables: AddRecipeToCollectionVariables) => void
  isPending: boolean
}

const toRecipeId = (value: unknown): string =>
  typeof value === "string"
    ? value
    : String((value as { id: string | number }).id)

export const useAddRecipeToCollection = (): UseAddRecipeToCollectionReturn => {
  const queryClient = useQueryClient()

  const mutation = useMutation<
    unknown,
    Error,
    AddRecipeToCollectionVariables,
    AddContext
  >({
    mutationFn: async ({ collectionId, recipeId }) => {
      const result = await addRecipeToCollection({ collectionId, recipeId })
      return match(result)
        .with({ status: "ok" }, ({ data }) => data)
        .with({ status: "unauthenticated" }, () => {
          throw new Error("You must be signed in to add to a collection.")
        })
        .with({ status: "forbidden" }, () => {
          throw new Error("You are not allowed to modify this collection.")
        })
        .with({ status: "validation-error" }, ({ message }) => {
          throw new Error(message)
        })
        .exhaustive()
    },
    onMutate: async ({ collectionId, recipeId }) => {
      await queryClient.cancelQueries({ queryKey: collectionsQueryKeys.list })
      const previous = queryClient.getQueryData<ReadonlyArray<Collection>>(
        collectionsQueryKeys.list
      )
      if (previous) {
        queryClient.setQueryData<ReadonlyArray<Collection>>(
          collectionsQueryKeys.list,
          previous.map((c) => {
            if (c.id !== collectionId) {
              return c
            }
            const ids = (c.recipes ?? []).map(toRecipeId)
            if (ids.includes(recipeId)) {
              return c
            }
            return { ...c, recipes: [...(c.recipes ?? []), recipeId] }
          })
        )
      }
      return { previous }
    },
    onError: (mutationError, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData<ReadonlyArray<Collection>>(
          collectionsQueryKeys.list,
          context.previous
        )
      }
      toast.error(mutationError.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.list })
    },
  })

  return {
    mutate: (variables) => mutation.mutate(variables),
    isPending: mutation.isPending,
  }
}
