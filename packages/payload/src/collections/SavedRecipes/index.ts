import { isAdmin } from "@mise/payload/access/isAdmin"
import type { CollectionConfig } from "payload"

export const SavedRecipes: CollectionConfig = {
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ["user", "recipe", "createdAt"],
    useAsTitle: "id",
  },
  fields: [
    {
      index: true,
      name: "user",
      relationTo: "users",
      required: true,
      type: "relationship",
    },
    {
      index: true,
      name: "recipe",
      relationTo: "recipes",
      required: true,
      type: "relationship",
    },
  ],
  indexes: [
    {
      fields: ["user", "recipe"],
      unique: true,
    },
  ],
  labels: {
    plural: "Saved Recipes",
    singular: "Saved Recipe",
  },
  slug: "saved-recipes",
  timestamps: true,
}
