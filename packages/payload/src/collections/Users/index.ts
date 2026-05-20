import type { CollectionConfig } from "payload"

export const Users: CollectionConfig = {
  admin: {
    useAsTitle: "email",
  },
  fields: [
    {
      name: "email",
      required: true,
      type: "email",
      unique: true,
    },
    {
      name: "name",
      type: "text",
    },
    {
      admin: {
        description: "BetterAuth user ID. Set automatically on sign-up.",
        readOnly: true,
      },
      index: true,
      name: "betterAuthId",
      type: "text",
    },
  ],
  slug: "users",
}
