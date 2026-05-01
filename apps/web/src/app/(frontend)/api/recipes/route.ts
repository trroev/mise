import { NextResponse } from "next/server"
import { getPublishedRecipes } from "~/lib/queries/published-recipes.server"

export const revalidate = 60

export async function GET() {
  const recipes = await getPublishedRecipes()
  return NextResponse.json(recipes)
}
