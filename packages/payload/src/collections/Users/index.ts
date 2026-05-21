import type { CollectionConfig, FieldAccess } from "payload"

const isAdminField: FieldAccess = ({ req: { user } }) => Boolean(user)

// Cloudinary transform string for header/profile thumbnail use:
// c_thumb,g_face,w_96,h_96
// Apply via `cloudinary.url(publicId, { transformation: [{ crop: "thumb", gravity: "face", width: 96, height: 96 }] })`
// or by inserting the string after `/upload/` in the secure_url.
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
    {
      access: {
        create: isAdminField,
        update: isAdminField,
      },
      admin: {
        description:
          "Cloudinary-backed avatar. Written by the uploadAvatar server action (overrides access) or by admins.",
      },
      fields: [
        {
          name: "url",
          type: "text",
        },
        {
          name: "publicId",
          type: "text",
        },
      ],
      name: "avatar",
      type: "group",
    },
  ],
  slug: "users",
}
