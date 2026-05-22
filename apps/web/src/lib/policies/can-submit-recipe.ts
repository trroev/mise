import type { Viewer } from "./viewer"

/**
 * Only signed-in users with a linked Payload `users` record may submit a
 * recipe through the public submission flow. Admins use the Payload admin UI
 * directly and are intentionally excluded here.
 */
export const canSubmitRecipe = (viewer: Viewer): boolean =>
  viewer?.kind === "user"
