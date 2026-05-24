import type { Collection } from "@mise/payload/payload-types"
import { match, P } from "ts-pattern"
import type { Viewer } from "./viewer"

/**
 * Admins can manage any collection; users can manage collections they own.
 * Anonymous viewers are never permitted.
 */
export const canManageCollection = (
  viewer: Viewer,
  collection: Pick<Collection, "owner">
): boolean =>
  match(viewer)
    .with({ kind: "admin" }, () => true)
    .with({ kind: "user" }, ({ user }) => {
      const ownerId = match(collection.owner)
        .with(P.string, (id) => id)
        .with({ id: P.string }, (o) => o.id)
        .otherwise(() => null)
      return ownerId !== null && ownerId === user.id
    })
    .with(null, () => false)
    .exhaustive()
