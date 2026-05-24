import type { Admin, User } from "@mise/payload/payload-types"
import { describe, expect, it } from "vitest"
import { canSaveRecipe } from "./can-save-recipe"

const admin = { id: "admin-1", collection: "admins" } as unknown as Admin
const user = { id: "user-1" } as unknown as User

describe("canSaveRecipe", () => {
  it("should permit an authenticated user", () => {
    expect(canSaveRecipe({ kind: "user", user })).toBe(true)
  })

  it("should deny admins", () => {
    expect(canSaveRecipe({ kind: "admin", admin })).toBe(false)
  })

  it("should deny anonymous viewers", () => {
    expect(canSaveRecipe(null)).toBe(false)
  })
})
