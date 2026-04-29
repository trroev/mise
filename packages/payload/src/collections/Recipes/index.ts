import { everyone } from "@mise/payload/access/everyone"
import { isAdmin } from "@mise/payload/access/isAdmin"
import { computeTotalTime } from "@mise/payload/hooks/computeTotalTime"
import { stampPublishedAt } from "@mise/payload/hooks/stampPublishedAt"
import { type CollectionConfig, slugField } from "payload"

export const Recipes: CollectionConfig = {
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: everyone,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ["title", "_status", "course", "difficulty", "publishedAt"],
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      required: true,
      type: "text",
    },
    slugField(),
    {
      name: "description",
      type: "textarea",
    },
    {
      name: "heroImage",
      relationTo: "media",
      type: "upload",
    },
    {
      name: "cuisine",
      relationTo: "cuisines",
      type: "relationship",
    },
    {
      name: "course",
      options: [
        { label: "Appetizer", value: "appetizer" },
        { label: "Entrée", value: "entrée" },
        { label: "Dessert", value: "dessert" },
        { label: "Side", value: "side" },
        { label: "Snack", value: "snack" },
        { label: "Bread", value: "bread" },
        { label: "Other", value: "other" },
      ],
      type: "select",
    },
    {
      name: "difficulty",
      options: [
        { label: "Easy", value: "easy" },
        { label: "Medium", value: "medium" },
        { label: "Hard", value: "hard" },
      ],
      type: "select",
    },
    {
      hasMany: true,
      name: "dietaryTags",
      options: [
        { label: "Vegetarian", value: "vegetarian" },
        { label: "Vegan", value: "vegan" },
        { label: "Gluten-Free", value: "gluten-free" },
        { label: "Dairy-Free", value: "dairy-free" },
        { label: "Nut-Free", value: "nut-free" },
      ],
      type: "select",
    },
    {
      admin: {
        description: "Preparation time in minutes.",
        position: "sidebar",
      },
      min: 0,
      name: "prepTime",
      type: "number",
    },
    {
      admin: {
        description: "Cook time in minutes.",
        position: "sidebar",
      },
      min: 0,
      name: "cookTime",
      type: "number",
    },
    {
      admin: {
        description: "Auto-computed from prep time + cook time.",
        position: "sidebar",
        readOnly: true,
      },
      name: "totalTime",
      type: "number",
    },
    {
      fields: [
        {
          min: 0,
          name: "quantity",
          type: "number",
        },
        {
          admin: {
            description: "e.g. 'servings', 'portions', 'cookies'.",
          },
          name: "unit",
          type: "text",
        },
      ],
      name: "yield",
      type: "group",
    },
    {
      admin: {
        date: { pickerAppearance: "dayAndTime" },
        description:
          "Set automatically the first time the recipe is published.",
        position: "sidebar",
        readOnly: true,
      },
      name: "publishedAt",
      type: "date",
    },
  ],
  hooks: {
    beforeChange: [computeTotalTime, stampPublishedAt],
  },
  labels: {
    plural: "Recipes",
    singular: "Recipe",
  },
  slug: "recipes",
  versions: {
    drafts: true,
  },
}
