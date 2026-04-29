import { everyone } from "@mise/payload/access/everyone"
import { isAdmin } from "@mise/payload/access/isAdmin"
import { type CollectionConfig, slugField } from "payload"

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
