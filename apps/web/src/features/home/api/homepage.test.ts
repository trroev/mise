import type { Homepage } from "@mise/payload/payload-types"
import { beforeEach, describe, expect, it, vi } from "vitest"

const findGlobal = vi.fn()

vi.mock("server-only", () => ({}))

vi.mock("payload", () => ({
  getPayload: vi.fn(async () => ({ findGlobal })),
}))

vi.mock("~/payload.config", () => ({ default: {} }))

vi.mock("next/cache", () => ({
  unstable_cache: <TArgs extends Array<unknown>, TReturn>(
    fn: (...args: TArgs) => TReturn
  ) => fn,
}))

describe("getHomepage", () => {
  beforeEach(() => {
    findGlobal.mockReset()
  })

  it("queries the homepage global with depth 2", async () => {
    const homepage = {
      heroHeadline: "Welcome",
      featuredRecipe: "recipe-id",
    } as unknown as Homepage
    findGlobal.mockResolvedValueOnce(homepage)

    const { getHomepage } = await import("./homepage")
    const result = await getHomepage()

    expect(findGlobal).toHaveBeenCalledWith({ slug: "homepage", depth: 2 })
    expect(result).toBe(homepage)
  })
})
