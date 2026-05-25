"use client"

import type { Collection } from "@mise/payload/payload-types"
import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import { match } from "ts-pattern"
import { listCollections } from "~/features/collections/actions/list-collections"
import { collectionsQueryKeys } from "../collections-query-keys"

const fetchCollections = async (): Promise<ReadonlyArray<Collection>> => {
  const result = await listCollections()
  return match(result)
    .with({ status: "ok" }, ({ data }) => data)
    .with({ status: "unauthenticated" }, () => [])
    .with({ status: "forbidden" }, () => [])
    .with({ status: "validation-error" }, () => [])
    .exhaustive()
}

export const useCollections = (): UseQueryResult<
  ReadonlyArray<Collection>,
  Error
> =>
  useQuery({
    queryKey: collectionsQueryKeys.list,
    queryFn: fetchCollections,
  })
