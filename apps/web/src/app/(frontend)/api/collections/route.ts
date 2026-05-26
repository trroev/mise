import type { Collection } from "@mise/payload/payload-types"
import { NextResponse } from "next/server"
import { listCollectionsForOwner } from "~/features/collections/api/list-collections"
import { getCurrentViewer } from "~/lib/queries/current-viewer"

export async function GET(): Promise<NextResponse<ReadonlyArray<Collection>>> {
  const viewer = await getCurrentViewer()
  if (viewer?.kind !== "user") {
    return NextResponse.json([])
  }
  const collections = await listCollectionsForOwner({
    ownerId: viewer.user.id,
  })
  return NextResponse.json(collections)
}
