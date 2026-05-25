"use client"

import type { Collection } from "@mise/payload/payload-types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { match } from "ts-pattern"
import { deleteCollection } from "~/features/collections/actions/delete-collection"
import { collectionsQueryKeys } from "../collections-query-keys"

type DeleteCollectionVariables = {
  collectionId: string
}

type DeleteContext = {
  previous: ReadonlyArray<Collection> | undefined
}

type UseDeleteCollectionReturn = {
  mutate: (variables: DeleteCollectionVariables) => Promise<boolean>
  isPending: boolean
}

export const useDeleteCollection = (): UseDeleteCollectionReturn => {
  const queryClient = useQueryClient()

  const mutation = useMutation<
    string,
    Error,
    DeleteCollectionVariables,
    DeleteContext
  >({
    mutationFn: async ({ collectionId }) => {
      const result = await deleteCollection({ collectionId })
      return match(result)
        .with({ status: "ok" }, ({ data }) => data.collectionId)
        .with({ status: "unauthenticated" }, () => {
          throw new Error("You must be signed in to delete a collection.")
        })
        .with({ status: "forbidden" }, () => {
          throw new Error("You are not allowed to delete this collection.")
        })
        .with({ status: "validation-error" }, ({ message }) => {
          throw new Error(message)
        })
        .exhaustive()
    },
    onMutate: async ({ collectionId }) => {
      await queryClient.cancelQueries({ queryKey: collectionsQueryKeys.list })
      const previous = queryClient.getQueryData<ReadonlyArray<Collection>>(
        collectionsQueryKeys.list
      )
      if (previous) {
        queryClient.setQueryData<ReadonlyArray<Collection>>(
          collectionsQueryKeys.list,
          previous.filter((c) => c.id !== collectionId)
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
    mutate: async (variables) => {
      try {
        await mutation.mutateAsync(variables)
        return true
      } catch {
        return false
      }
    },
    isPending: mutation.isPending,
  }
}
