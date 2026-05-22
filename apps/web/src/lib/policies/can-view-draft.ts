import type { Recipe } from "@mise/payload/payload-types"
import { match, P } from "ts-pattern"
import type { Viewer } from "./viewer"

/**
 * Authors can preview their own drafts; admins can preview any draft.
 * Anonymous viewers are never permitted.
 */
export const canViewDraft = (
  viewer: Viewer,
  recipe: Pick<Recipe, "authorUser">
): boolean =>
  match(viewer)
    .with({ kind: "admin" }, () => true)
    .with({ kind: "user" }, ({ user }) => {
      const authorUserId = match(recipe.authorUser)
        .with(P.string, (id) => id)
        .with({ id: P.string }, (u) => u.id)
        .otherwise(() => null)
      return authorUserId !== null && authorUserId === user.id
    })
    .with(null, () => false)
    .exhaustive()
