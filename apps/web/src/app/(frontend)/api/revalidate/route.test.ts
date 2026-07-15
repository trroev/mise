import { beforeEach, describe, expect, it, vi } from "vitest"

const revalidatePath = vi.fn()
const revalidateTag = vi.fn()

vi.mock("next/cache", () => ({
  revalidatePath: (...args: Array<unknown>) => revalidatePath(...args),
  revalidateTag: (...args: Array<unknown>) => revalidateTag(...args),
}))

vi.mock("@mise/env/app", () => ({
  env: { REVALIDATION_SECRET: "test-secret" },
}))

const buildRequest = ({
  body,
  secret = "test-secret",
}: Readonly<{ body: unknown; secret?: string }>) =>
  new Request("http://localhost/api/revalidate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify(body),
  })

describe("POST /api/revalidate", () => {
  beforeEach(() => {
    revalidatePath.mockReset()
    revalidateTag.mockReset()
  })

  it("rejects requests without a valid secret", async () => {
    const { POST } = await import("./route")
    const res = await POST(
      buildRequest({ body: { slug: "pancakes" }, secret: "wrong" }) as never
    )

    expect(res.status).toBe(401)
    expect(revalidatePath).not.toHaveBeenCalled()
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it("revalidates the recipe detail tag and paths for a slug", async () => {
    const { POST } = await import("./route")
    const res = await POST(
      buildRequest({ body: { slug: "pancakes" } }) as never
    )

    expect(res.status).toBe(200)
    expect(revalidateTag).toHaveBeenCalledWith("recipe:pancakes", "default")
    expect(revalidateTag).toHaveBeenCalledWith("latest-recipes", "default")
    expect(revalidatePath).toHaveBeenCalledWith("/recipes/pancakes")
    expect(revalidatePath).toHaveBeenCalledWith("/recipes")
    expect(revalidatePath).toHaveBeenCalledWith("/")
  })

  it("revalidates the homepage tag", async () => {
    const { POST } = await import("./route")
    const res = await POST(buildRequest({ body: { tag: "homepage" } }) as never)

    expect(res.status).toBe(200)
    expect(revalidateTag).toHaveBeenCalledWith("homepage", "default")
    expect(revalidatePath).toHaveBeenCalledWith("/")
  })
})
