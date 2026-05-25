"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useCallback, useState } from "react"
import { match } from "ts-pattern"
import { createCollection } from "~/features/collections/actions/create-collection"
import { collectionsQueryKeys } from "../collections-query-keys"

type CreateCollectionVariables = {
  name: string
}

type FieldError = {
  field: string
  message: string
}

type UseCreateCollectionReturn = {
  mutate: (variables: CreateCollectionVariables) => Promise<string | null>
  isPending: boolean
  fieldError: FieldError | null
  reset: () => void
}

export const useCreateCollection = (): UseCreateCollectionReturn => {
  const queryClient = useQueryClient()
  const [fieldError, setFieldError] = useState<FieldError | null>(null)

  const mutation = useMutation<string, Error, CreateCollectionVariables>({
    mutationFn: async ({ name }) => {
      const result = await createCollection({ name })
      return match(result)
        .with({ status: "ok" }, ({ data }) => data.collectionId)
        .with({ status: "unauthenticated" }, () => {
          throw new Error("You must be signed in to create a collection.")
        })
        .with({ status: "forbidden" }, () => {
          throw new Error("You are not allowed to create a collection.")
        })
        .with({ status: "validation-error" }, ({ field, message }) => {
          setFieldError({ field, message })
          throw new Error(message)
        })
        .exhaustive()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.list })
    },
  })

  const mutateAsync = mutation.mutateAsync
  const mutationReset = mutation.reset

  const mutate = useCallback(
    async (variables: CreateCollectionVariables): Promise<string | null> => {
      setFieldError(null)
      try {
        return await mutateAsync(variables)
      } catch {
        return null
      }
    },
    [mutateAsync]
  )

  const reset = useCallback((): void => {
    setFieldError(null)
    mutationReset()
  }, [mutationReset])

  return {
    mutate,
    isPending: mutation.isPending,
    fieldError,
    reset,
  }
}
