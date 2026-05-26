import { NextResponse } from "next/server"
import { listSavedRecipesForUser } from "~/features/saved-recipes/api/list-saved-recipes"
import { canSaveRecipe } from "~/lib/policies/can-save-recipe"
import { getCurrentViewer } from "~/lib/queries/current-viewer"

export async function GET(): Promise<NextResponse<ReadonlyArray<string>>> {
  const viewer = await getCurrentViewer()
  if (!canSaveRecipe(viewer) || viewer?.kind !== "user") {
    return NextResponse.json([])
  }
  const recipes = await listSavedRecipesForUser({ userId: viewer.user.id })
  const ids = recipes.map((ref) =>
    typeof ref === "string" ? ref : String(ref.id)
  )
  return NextResponse.json(ids)
}
