import type { Field } from "payload"

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

type SlugFieldOptions = {
  readonly sourceField?: string
}

export const slugField = ({
  sourceField = "name",
}: SlugFieldOptions = {}): Field => ({
  admin: {
    description: "Auto-generated from name. Edit to override.",
    position: "sidebar",
  },
  hooks: {
    beforeValidate: [
      ({ data, value }) => {
        if (typeof value === "string" && value.trim().length > 0) {
          return slugify(value)
        }
        const source = data?.[sourceField]
        if (typeof source === "string" && source.trim().length > 0) {
          return slugify(source)
        }
        return value
      },
    ],
  },
  index: true,
  name: "slug",
  required: true,
  type: "text",
  unique: true,
})
