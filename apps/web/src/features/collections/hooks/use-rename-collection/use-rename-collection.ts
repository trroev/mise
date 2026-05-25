"use client"

import type { Collection } from "@mise/payload/payload-types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import { match } from "ts-pattern"
import { renameCollection } from "~/features/collections/actions/rename-collection"
import { collectionsQueryKeys } from "../collections-query-keys"

type RenameCollectionVariables = {
  collectionId: string
  name: string
}

type FieldError = {
  field: string
  message: string
}

type RenameContext = {
  previous: ReadonlyArray<Collection> | undefined
}

type UseRenameCollectionReturn = {
  mutate: (variables: RenameCollectionVariables) => Promise<boolean>
  isPending: boolean
  fieldError: FieldError | null
  reset: () => void
}

export const useRenameCollection = (): UseRenameCollectionReturn => {
  const queryClient = useQueryClient()
  const [fieldError, setFieldError] = useState<FieldError | null>(null)

  const mutation = useMutation<
    string,
    Error,
    RenameCollectionVariables,
    RenameContext
  >({
    mutationFn: async ({ collectionId, name }) => {
      const result = await renameCollection({ collectionId, name })
      return match(result)
        .with({ status: "ok" }, ({ data }) => data.collectionId)
        .with({ status: "unauthenticated" }, () => {
          throw new Error("You must be signed in to rename a collection.")
        })
        .with({ status: "forbidden" }, () => {
          throw new Error("You are not allowed to rename this collection.")
        })
        .with({ status: "validation-error" }, ({ field, message }) => {
          setFieldError({ field, message })
          throw new Error(message)
        })
        .exhaustive()
    },
    onMutate: async ({ collectionId, name }) => {
      await queryClient.cancelQueries({ queryKey: collectionsQueryKeys.list })
      const previous = queryClient.getQueryData<ReadonlyArray<Collection>>(
        collectionsQueryKeys.list
      )
      if (previous) {
        queryClient.setQueryData<ReadonlyArray<Collection>>(
          collectionsQueryKeys.list,
          previous.map((c) => (c.id === collectionId ? { ...c, name } : c))
        )
      }
      setFieldError(null)
      return { previous }
    },
    onError: (mutationError, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData<ReadonlyArray<Collection>>(
          collectionsQueryKeys.list,
          context.previous
        )
      }
      if (fieldError === null) {
        toast.error(mutationError.message)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.list })
    },
  })

  return {
    mutate: async (variables) => {
      setFieldError(null)
      try {
        await mutation.mutateAsync(variables)
        return true
      } catch {
        return false
      }
    },
    isPending: mutation.isPending,
    fieldError,
    reset: () => {
      setFieldError(null)
      mutation.reset()
    },
  }
}
