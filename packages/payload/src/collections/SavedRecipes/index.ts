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
    defaultColumns: ["user", "recipes", "createdAt"],
    useAsTitle: "id",
  },
  fields: [
    {
      index: true,
      name: "user",
      relationTo: "users",
      required: true,
      type: "relationship",
      unique: true,
    },
    {
      hasMany: true,
      index: true,
      name: "recipes",
      relationTo: "recipes",
      type: "relationship",
    },
  ],
  labels: {
    plural: "Saved Recipes",
    singular: "Saved Recipe",
  },
  slug: "saved-recipes",
  timestamps: true,
}
