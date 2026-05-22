import type { Admin, User } from "@mise/payload/payload-types"
import { describe, expect, it } from "vitest"
import { canSubmitRecipe } from "./can-submit-recipe"

const admin = { id: "admin-1", collection: "admins" } as unknown as Admin
const user = { id: "user-1" } as unknown as User

describe("canSubmitRecipe", () => {
  it("permits signed-in users", () => {
    expect(canSubmitRecipe({ kind: "user", user })).toBe(true)
  })

  it("denies admins", () => {
    expect(canSubmitRecipe({ kind: "admin", admin })).toBe(false)
  })

  it("denies anonymous viewers", () => {
    expect(canSubmitRecipe(null)).toBe(false)
  })
})
