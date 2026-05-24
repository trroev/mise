import { isAdmin } from "@mise/payload/access/isAdmin"
import type { CollectionBeforeValidateHook, CollectionConfig } from "payload"

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const deriveSlug: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) {
    return data
  }
  const name = typeof data.name === "string" ? data.name : ""
  const next = slugify(name)
  if (next.length === 0) {
    return data
  }
  return { ...data, slug: next }
}

export const Collections: CollectionConfig = {
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ["name", "owner", "createdAt"],
    useAsTitle: "name",
  },
  fields: [
    {
      index: true,
      name: "name",
      required: true,
      type: "text",
    },
    {
      admin: { readOnly: true },
      index: true,
      name: "slug",
      type: "text",
    },
    {
      index: true,
      name: "owner",
      relationTo: "users",
      required: true,
      type: "relationship",
    },
    {
      hasMany: true,
      index: true,
      name: "recipes",
      relationTo: "recipes",
      type: "relationship",
    },
  ],
  hooks: {
    beforeValidate: [deriveSlug],
  },
  indexes: [
    { fields: ["owner", "slug"], unique: true },
    { fields: ["owner", "name"], unique: true },
  ],
  labels: {
    plural: "Collections",
    singular: "Collection",
  },
  slug: "collections",
  timestamps: true,
}
