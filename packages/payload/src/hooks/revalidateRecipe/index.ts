import { env } from "@mise/env/app"
import type { CollectionAfterChangeHook } from "payload"

export const revalidateRecipe: CollectionAfterChangeHook = async ({ doc }) => {
  if (doc._status !== "published") {
    return doc
  }

  try {
    const res = await fetch(`${env.BASE_URL}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.REVALIDATION_SECRET}`,
      },
      body: JSON.stringify({ slug: doc.slug }),
    })

    if (!res.ok) {
      console.error(
        `[revalidateRecipe] Revalidation failed: ${res.status} ${res.statusText}`
      )
    }
  } catch (error) {
    console.error("[revalidateRecipe] Revalidation request failed:", error)
  }

  return doc
}
