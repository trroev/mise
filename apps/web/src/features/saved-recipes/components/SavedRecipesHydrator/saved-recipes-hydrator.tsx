"use client"

import { useQueryClient } from "@tanstack/react-query"
import { savedRecipesQueryKeys } from "~/features/saved-recipes/hooks/saved-recipes-query-keys"

type SavedRecipesHydratorProps = {
  initialIds: ReadonlyArray<string>
}

export const SavedRecipesHydrator = ({
  initialIds,
}: SavedRecipesHydratorProps) => {
  const queryClient = useQueryClient()
  if (
    queryClient.getQueryData<ReadonlyArray<string>>(
      savedRecipesQueryKeys.ids
    ) === undefined
  ) {
    queryClient.setQueryData<ReadonlyArray<string>>(
      savedRecipesQueryKeys.ids,
      initialIds
    )
  }
  return null
}
