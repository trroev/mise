import type { Admin, Recipe, User } from "@mise/payload/payload-types"
import { describe, expect, it } from "vitest"
import { canViewDraft } from "./can-view-draft"

const admin = { id: "admin-1", collection: "admins" } as unknown as Admin
const user = { id: "user-1" } as unknown as User
const otherUser = { id: "user-2" } as unknown as User

const recipeWithStringAuthor = {
  authorUser: "user-1",
} as unknown as Pick<Recipe, "authorUser">

const recipeWithObjectAuthor = {
  authorUser: { id: "user-1" },
} as unknown as Pick<Recipe, "authorUser">

const recipeWithoutAuthor = {
  authorUser: null,
} as unknown as Pick<Recipe, "authorUser">

describe("canViewDraft", () => {
  it("permits admins regardless of author", () => {
    expect(canViewDraft({ kind: "admin", admin }, recipeWithStringAuthor)).toBe(
      true
    )
    expect(canViewDraft({ kind: "admin", admin }, recipeWithoutAuthor)).toBe(
      true
    )
  })

  it("permits the author whether authorUser is a string or populated object", () => {
    expect(canViewDraft({ kind: "user", user }, recipeWithStringAuthor)).toBe(
      true
    )
    expect(canViewDraft({ kind: "user", user }, recipeWithObjectAuthor)).toBe(
      true
    )
  })

  it("denies a non-author user", () => {
    expect(
      canViewDraft({ kind: "user", user: otherUser }, recipeWithStringAuthor)
    ).toBe(false)
  })

  it("denies when the recipe has no author", () => {
    expect(canViewDraft({ kind: "user", user }, recipeWithoutAuthor)).toBe(
      false
    )
  })

  it("denies anonymous viewers", () => {
    expect(canViewDraft(null, recipeWithStringAuthor)).toBe(false)
  })
})
