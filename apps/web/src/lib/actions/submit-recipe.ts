"use server"

import "server-only"

import type { Recipe } from "@mise/payload/payload-types"
import { headers } from "next/headers"
import { getPayload } from "payload"
import { z } from "zod"
import { auth } from "~/lib/auth.server"
import config from "~/payload.config"

const ingredientSchema = z.object({
  name: z.string().trim().min(1, "Ingredient name is required."),
  quantity: z.number().min(0, "Quantity must be zero or greater."),
  unit: z.string().min(1, "Unit is required."),
  prepNote: z.string().trim().optional(),
})

const ingredientGroupSchema = z.object({
  groupLabel: z.string().trim().optional(),
  ingredients: z.array(ingredientSchema).min(1, "Add at least one ingredient."),
})

const stepSchema = z.object({
  description: z.string().trim().min(1, "Step description is required."),
  timerMinutes: z.number().min(0).optional(),
})

const instructionGroupSchema = z.object({
  groupLabel: z.string().trim().optional(),
  steps: z.array(stepSchema).min(1, "Add at least one step."),
})

const courseValues = [
  "appetizer",
  "entrée",
  "dessert",
  "side",
  "snack",
  "bread",
  "other",
] as const satisfies ReadonlyArray<string>

const difficultyValues = [
  "easy",
  "medium",
  "hard",
] as const satisfies ReadonlyArray<string>

const dietaryTagValues = [
  "vegetarian",
  "vegan",
  "gluten-free",
  "dairy-free",
  "nut-free",
] as const satisfies ReadonlyArray<string>

export const submitRecipeSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  description: z.string().trim().optional(),
  cuisine: z.string().optional(),
  course: z.enum(courseValues).optional(),
  difficulty: z.enum(difficultyValues).optional(),
  dietaryTags: z.array(z.enum(dietaryTagValues)).optional(),
  prepTime: z.number().min(0).optional(),
  cookTime: z.number().min(0).optional(),
  yield: z
    .object({
      quantity: z.number().min(0).optional(),
      unit: z.string().trim().optional(),
    })
    .optional(),
  ingredientGroups: z
    .array(ingredientGroupSchema)
    .min(1, "Add at least one ingredient group."),
  instructionGroups: z
    .array(instructionGroupSchema)
    .min(1, "Add at least one instruction group."),
})

export type SubmitRecipeInput = z.infer<typeof submitRecipeSchema>

export type SubmitRecipeResult =
  | { status: "success"; recipeId: string; slug: string }
  | { status: "error"; message: string }

const MAX_IMAGE_BYTES = 8 * 1024 * 1024

type ParsedInput =
  | { ok: true; data: SubmitRecipeInput }
  | { ok: false; message: string }

const parseSubmissionPayload = (formData: FormData): ParsedInput => {
  const rawData = formData.get("data")
  if (typeof rawData !== "string") {
    return { ok: false, message: "Invalid submission payload." }
  }
  let parsedJson: unknown
  try {
    parsedJson = JSON.parse(rawData)
  } catch {
    return { ok: false, message: "Invalid submission payload." }
  }
  const parsed = submitRecipeSchema.safeParse(parsedJson)
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Some fields are invalid.",
    }
  }
  return { ok: true, data: parsed.data }
}

type HeroImageInput =
  | { kind: "none" }
  | { kind: "invalid"; message: string }
  | { kind: "valid"; file: File; alt: string }

const readHeroImage = (formData: FormData): HeroImageInput => {
  const heroImage = formData.get("heroImage")
  if (!heroImage) {
    return { kind: "none" }
  }
  if (!(heroImage instanceof File) || heroImage.size === 0) {
    if (heroImage instanceof File) {
      return { kind: "none" }
    }
    return { kind: "invalid", message: "Invalid hero image." }
  }
  if (heroImage.size > MAX_IMAGE_BYTES) {
    return { kind: "invalid", message: "Hero image must be under 8 MB." }
  }
  const heroImageAlt = formData.get("heroImageAlt")
  if (typeof heroImageAlt !== "string" || heroImageAlt.trim().length === 0) {
    return {
      kind: "invalid",
      message: "Provide alt text describing the hero image.",
    }
  }
  return { kind: "valid", file: heroImage, alt: heroImageAlt.trim() }
}

const uploadHeroImage = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  file: File,
  alt: string
): Promise<string> => {
  const buffer = Buffer.from(await file.arrayBuffer())
  const media = await payload.create({
    collection: "media",
    data: { alt },
    file: {
      data: buffer,
      mimetype: file.type || "application/octet-stream",
      name: file.name || "hero-image",
      size: file.size,
    },
    overrideAccess: true,
  })
  return String(media.id)
}

export async function submitRecipeAction(
  formData: FormData
): Promise<SubmitRecipeResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return {
      status: "error",
      message: "You must be signed in to submit a recipe.",
    }
  }

  const parsed = parseSubmissionPayload(formData)
  if (!parsed.ok) {
    return { status: "error", message: parsed.message }
  }
  const input = parsed.data

  const hero = readHeroImage(formData)
  if (hero.kind === "invalid") {
    return { status: "error", message: hero.message }
  }

  const payload = await getPayload({ config })

  const userDocs = await payload.find({
    collection: "users",
    where: { betterAuthId: { equals: session.user.id } },
    limit: 1,
    overrideAccess: true,
  })
  const authorUser = userDocs.docs[0]
  if (!authorUser) {
    return {
      status: "error",
      message: "Your user record is not linked. Try signing out and back in.",
    }
  }

  const heroImageId =
    hero.kind === "valid"
      ? await uploadHeroImage(payload, hero.file, hero.alt)
      : undefined

  const recipeData: Partial<Recipe> = {
    title: input.title,
    description: input.description,
    cuisine: input.cuisine,
    course: input.course,
    difficulty: input.difficulty,
    dietaryTags: input.dietaryTags,
    prepTime: input.prepTime,
    cookTime: input.cookTime,
    yield: input.yield,
    ingredientGroups: input.ingredientGroups,
    instructionGroups: input.instructionGroups,
    author: authorUser.name || session.user.name || session.user.email,
    authorUser: authorUser.id,
    heroImage: heroImageId,
  }

  const created = await payload.create({
    collection: "recipes",
    // biome-ignore lint/suspicious/noExplicitAny: Payload's create signature is overly strict for our partial shape
    data: recipeData as any,
    draft: true,
    overrideAccess: true,
  })

  return {
    status: "success",
    recipeId: String(created.id),
    slug: created.slug ?? String(created.id),
  }
}
