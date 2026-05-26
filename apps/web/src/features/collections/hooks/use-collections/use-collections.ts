"use client"

import type { Collection } from "@mise/payload/payload-types"
import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import { collectionsQueryKeys } from "../collections-query-keys"

const fetchCollections = async (): Promise<ReadonlyArray<Collection>> => {
  const response = await fetch("/api/collections", {
    headers: { accept: "application/json" },
  })
  if (!response.ok) {
    throw new Error("Failed to load collections")
  }
  return (await response.json()) as ReadonlyArray<Collection>
}

export const useCollections = (): UseQueryResult<
  ReadonlyArray<Collection>,
  Error
> =>
  useQuery({
    queryKey: collectionsQueryKeys.list,
    queryFn: fetchCollections,
  })
