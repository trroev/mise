"use server"

import "server-only"

import type { Collection } from "@mise/payload/payload-types"
import { captureException } from "@sentry/nextjs"
import { unstable_rethrow } from "next/navigation"
import { listCollectionsForOwner } from "~/features/collections/api/list-collections"
import type { CollectionsActionResult } from "~/features/collections/types/result"
import { getCurrentViewer } from "~/lib/queries/current-viewer"

export type ListCollectionsData = ReadonlyArray<Collection>
export type ListCollectionsResult = CollectionsActionResult<ListCollectionsData>

export const listCollections = async (): Promise<ListCollectionsResult> => {
  try {
    const viewer = await getCurrentViewer()
    if (viewer?.kind !== "user") {
      return { status: "unauthenticated" }
    }
    const collections = await listCollectionsForOwner({
      ownerId: viewer.user.id,
    })
    return { status: "ok", data: collections }
  } catch (error) {
    unstable_rethrow(error)
    captureException(error)
    return {
      status: "validation-error",
      field: "list",
      message: "Could not load collections. Please try again.",
    }
  }
}
