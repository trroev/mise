"use client"

import type { Collection } from "@mise/payload/payload-types"
import { useQueryClient } from "@tanstack/react-query"
import { collectionsQueryKeys } from "~/features/collections/hooks/collections-query-keys"

type CollectionsHydratorProps = {
  initialCollections: ReadonlyArray<Collection>
}

export const CollectionsHydrator = ({
  initialCollections,
}: CollectionsHydratorProps) => {
  const queryClient = useQueryClient()
  if (
    queryClient.getQueryData<ReadonlyArray<Collection>>(
      collectionsQueryKeys.list
    ) === undefined
  ) {
    queryClient.setQueryData<ReadonlyArray<Collection>>(
      collectionsQueryKeys.list,
      initialCollections
    )
  }
  return null
}
