import type { CollectionConfig } from "payload"
import { everyone } from "../../access/everyone"
import { isAdmin } from "../../access/isAdmin"
import { slugField } from "../../fields/slugField"

export const Tags: CollectionConfig = {
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: everyone,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ["name", "slug"],
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
  ],
  labels: {
    plural: "Tags",
    singular: "Tag",
  },
  slug: "tags",
}
