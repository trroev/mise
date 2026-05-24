import type { Admin, Collection, User } from "@mise/payload/payload-types"
import { describe, expect, it } from "vitest"
import { canManageCollection } from "./can-manage-collection"

const admin = { id: "admin-1", collection: "admins" } as unknown as Admin
const user = { id: "user-1" } as unknown as User
const otherUser = { id: "user-2" } as unknown as User

const collectionOwnedBy = (ownerId: string): Pick<Collection, "owner"> => ({
  owner: ownerId,
})

const collectionOwnedByObject = (ownerId: string): Pick<Collection, "owner"> =>
  ({ owner: { id: ownerId } }) as unknown as Pick<Collection, "owner">

describe("canManageCollection", () => {
  it("should permit an admin regardless of owner", () => {
    expect(
      canManageCollection({ kind: "admin", admin }, collectionOwnedBy("user-1"))
    ).toBe(true)
  })

  it("should permit the owning user when owner is a string id", () => {
    expect(
      canManageCollection({ kind: "user", user }, collectionOwnedBy("user-1"))
    ).toBe(true)
  })

  it("should permit the owning user when owner is a populated object", () => {
    expect(
      canManageCollection(
        { kind: "user", user },
        collectionOwnedByObject("user-1")
      )
    ).toBe(true)
  })

  it("should deny a user who does not own the collection", () => {
    expect(
      canManageCollection(
        { kind: "user", user: otherUser },
        collectionOwnedBy("user-1")
      )
    ).toBe(false)
  })

  it("should deny anonymous viewers", () => {
    expect(canManageCollection(null, collectionOwnedBy("user-1"))).toBe(false)
  })
})
