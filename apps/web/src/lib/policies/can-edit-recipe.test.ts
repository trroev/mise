import type { Admin, Recipe, User } from "@mise/payload/payload-types"
import { describe, expect, it } from "vitest"
import { canEditRecipe } from "./can-edit-recipe"

const admin = { id: "admin-1", collection: "admins" } as unknown as Admin
const user = { id: "user-1" } as unknown as User
const otherUser = { id: "user-2" } as unknown as User

const recipe = {
  authorUser: "user-1",
} as unknown as Pick<Recipe, "authorUser">

describe("canEditRecipe", () => {
  it("permits admins", () => {
    expect(canEditRecipe({ kind: "admin", admin }, recipe)).toBe(true)
  })

  it("permits the author", () => {
    expect(canEditRecipe({ kind: "user", user }, recipe)).toBe(true)
  })

  it("denies a non-author user", () => {
    expect(canEditRecipe({ kind: "user", user: otherUser }, recipe)).toBe(false)
  })

  it("denies anonymous viewers", () => {
    expect(canEditRecipe(null, recipe)).toBe(false)
  })
})
