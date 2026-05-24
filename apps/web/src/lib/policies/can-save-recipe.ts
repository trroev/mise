import { match } from "ts-pattern"
import type { Viewer } from "./viewer"

export const canSaveRecipe = (viewer: Viewer): boolean =>
  match(viewer)
    .with({ kind: "user" }, () => true)
    .with({ kind: "admin" }, () => false)
    .with(null, () => false)
    .exhaustive()
