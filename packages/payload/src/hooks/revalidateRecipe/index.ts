import type { CollectionAfterChangeHook } from "payload"

export const revalidateRecipe: CollectionAfterChangeHook = async ({ doc }) => {
  if (doc._status !== "published") {
    return doc
  }

  const baseUrl = process.env.BASE_URL
  const secret = process.env.REVALIDATION_SECRET

  if (!(baseUrl && secret)) {
    console.warn(
      "[revalidateRecipe] BASE_URL or REVALIDATION_SECRET not configured — skipping revalidation"
    )
    return doc
  }

  try {
    const res = await fetch(`${baseUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
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
