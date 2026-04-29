import { everyone } from "@mise/payload/access/everyone"
import { isAdmin } from "@mise/payload/access/isAdmin"
import { type CollectionConfig, slugField } from "payload"

export const Ingredients: CollectionConfig = {
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: everyone,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ["name", "slug", "defaultUnit"],
    useAsTitle: "name",
  },
  fields: [
    {
      index: true,
      name: "name",
      required: true,
      type: "text",
      unique: true,
    },
    slugField(),
    {
      admin: {
        description:
          "Alternate names for this ingredient (e.g. 'cilantro' for 'coriander').",
      },
      hasMany: true,
      name: "aliases",
      type: "text",
    },
    {
      admin: {
        description:
          "Default unit suggested when this ingredient is added to a recipe.",
      },
      name: "defaultUnit",
      relationTo: "units",
      type: "relationship",
    },
  ],
  labels: {
    plural: "Ingredients",
    singular: "Ingredient",
  },
  slug: "ingredients",
}
