import { everyone } from "@mise/payload/access/everyone"
import { isAdmin } from "@mise/payload/access/isAdmin"
import { revalidateHomepage } from "@mise/payload/hooks/revalidateHomepage"
import type { GlobalConfig } from "payload"

export const Homepage: GlobalConfig = {
  slug: "homepage",
  access: {
    read: everyone,
    update: isAdmin,
  },
  admin: {
    description:
      "Curate the homepage hero copy and featured recipe without a deploy.",
  },
  fields: [
    {
      admin: {
        description: "Headline shown in the homepage hero.",
      },
      defaultValue: "Recipes from a Michelin-trained kitchen",
      name: "heroHeadline",
      required: true,
      type: "text",
    },
    {
      admin: {
        description: "Optional supporting line shown beneath the headline.",
      },
      defaultValue:
        "Carefully tested recipes, refined techniques, and a chef's perspective.",
      name: "heroTagline",
      type: "text",
    },
    {
      admin: {
        description: "Label for the primary call-to-action button.",
      },
      defaultValue: "Browse recipes",
      name: "heroCtaLabel",
      type: "text",
    },
    {
      admin: {
        description: "Destination for the primary call-to-action button.",
      },
      defaultValue: "/recipes",
      name: "heroCtaHref",
      type: "text",
    },
    {
      admin: {
        description: "Optional hero background image.",
      },
      name: "heroImage",
      relationTo: "media",
      type: "upload",
    },
    {
      admin: {
        description: "The recipe featured on the homepage.",
      },
      filterOptions: () => ({
        _status: { equals: "published" },
      }),
      name: "featuredRecipe",
      relationTo: "recipes",
      required: true,
      type: "relationship",
    },
  ],
  hooks: {
    afterChange: [revalidateHomepage],
  },
  label: "Homepage",
}
