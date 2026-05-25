import "server-only"

import { listCollectionsForOwner } from "~/features/collections/api/list-collections"
import { CollectionsErrorBoundary } from "~/features/collections/components/CollectionsErrorBoundary"
import { CollectionsHydrator } from "~/features/collections/components/CollectionsHydrator"
import { CollectionsList } from "./collections-list"

type CollectionsTabProps = {
  payloadUserId: string
}

export const CollectionsTab = async ({
  payloadUserId,
}: CollectionsTabProps) => {
  const collections = await listCollectionsForOwner({ ownerId: payloadUserId })
  return (
    <CollectionsErrorBoundary>
      <CollectionsHydrator initialCollections={collections} />
      <CollectionsList />
    </CollectionsErrorBoundary>
  )
}
