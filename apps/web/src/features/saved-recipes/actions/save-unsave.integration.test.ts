import {
  type PayloadTestHarness,
  startPayloadTest,
} from "@mise/testing/payload"
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest"
import { seedSavedRecipesFixtures } from "./__fixtures__/seed"

const getCurrentViewer = vi.fn()

vi.mock("server-only", () => ({}))
vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }))
vi.mock("next/navigation", () => ({ unstable_rethrow: vi.fn() }))
vi.mock("~/lib/queries/current-viewer", () => ({ getCurrentViewer }))

type SaveRecipe = typeof import("./save-recipe").saveRecipe
type UnsaveRecipe = typeof import("./unsave-recipe").unsaveRecipe
type ListSavedRecipes = typeof import("./list-saved-recipes").listSavedRecipes

describe("saved-recipes action flow (integration)", () => {
  let harness: PayloadTestHarness
  let userId: string
  let recipeId: string
  let saveRecipe: SaveRecipe
  let unsaveRecipe: UnsaveRecipe
  let listSavedRecipes: ListSavedRecipes

  beforeAll(async () => {
    harness = await startPayloadTest({
      loadPayload: async () => {
        const { getPayload } = await import("payload")
        const { default: config } = await import("~/payload.config")
        return getPayload({ config })
      },
    })

    const seed = await seedSavedRecipesFixtures(harness.payload)
    userId = seed.userId
    recipeId = seed.recipeId
    ;({ saveRecipe } = await import("./save-recipe"))
    ;({ unsaveRecipe } = await import("./unsave-recipe"))
    ;({ listSavedRecipes } = await import("./list-saved-recipes"))
  })

  afterAll(async () => {
    await harness.teardown()
  })

  beforeEach(() => {
    getCurrentViewer.mockReset()
    getCurrentViewer.mockResolvedValue({ kind: "user", user: { id: userId } })
  })

  it("persists a save, lists it, then clears it on unsave", async () => {
    const saveResult = await saveRecipe({ recipeId })
    expect(saveResult.status).toBe("ok")

    const afterSave = await harness.payload.find({
      collection: "saved-recipes",
      depth: 0,
      overrideAccess: true,
      where: { user: { equals: userId } },
    })
    expect(afterSave.docs).toHaveLength(1)
    expect((afterSave.docs[0]?.recipes ?? []).map(String)).toContain(recipeId)

    const listed = await listSavedRecipes()
    expect(listed.status).toBe("ok")
    if (listed.status === "ok") {
      const ids = listed.data.map((ref) =>
        typeof ref === "string" ? ref : String(ref.id)
      )
      expect(ids).toContain(recipeId)
    }

    const unsaveResult = await unsaveRecipe({ recipeId })
    expect(unsaveResult).toEqual({ status: "ok", data: { removed: 1 } })

    const afterUnsave = await listSavedRecipes()
    expect(afterUnsave.status).toBe("ok")
    if (afterUnsave.status === "ok") {
      expect(afterUnsave.data).toHaveLength(0)
    }
  })
})
