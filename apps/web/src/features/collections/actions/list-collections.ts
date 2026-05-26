"use server"

import "server-only"

import type { Collection } from "@mise/payload/payload-types"
import { listCollectionsForOwner } from "~/features/collections/api/list-collections"
import type { CollectionsActionResult } from "~/features/collections/types/result"
import { getCurrentViewer } from "~/lib/queries/current-viewer"
import { serverAction } from "~/lib/server-action"

export type ListCollectionsData = ReadonlyArray<Collection>
export type ListCollectionsResult = CollectionsActionResult<ListCollectionsData>

const listCollectionsImpl = async (): Promise<ListCollectionsResult> => {
  const viewer = await getCurrentViewer()
  if (viewer?.kind !== "user") {
    return { status: "unauthenticated" }
  }
  const collections = await listCollectionsForOwner({
    ownerId: viewer.user.id,
  })
  return { status: "ok", data: collections }
}

export const listCollections = serverAction(listCollectionsImpl, {
  fallback: {
    status: "validation-error",
    field: "list",
    message: "Could not load collections. Please try again.",
  },
})
