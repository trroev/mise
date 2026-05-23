"use client"

import type { Cuisine, Unit } from "@mise/payload/payload-types"
import { Button } from "@mise/ui/components/Button"
import { captureException } from "@sentry/nextjs"
import Link from "next/link"
import { useState } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { match } from "ts-pattern"
import { WidgetErrorFallback } from "~/components/WidgetErrorFallback"
import { submitRecipeAction } from "~/features/recipes/actions/submit-recipe"
import { DietaryTagsField } from "./dietary-tags-field"
import { HeroImageField } from "./hero-image-field"
import { IngredientGroupsField } from "./ingredient-groups-field"
import { InstructionGroupsField } from "./instruction-groups-field"
import { RecipeMetaFields } from "./recipe-meta-fields"
import {
  type Course,
  type DietaryTag,
  type Difficulty,
  parseOptionalNumber,
  type RecipeSubmissionFormValues,
  useRecipeForm,
} from "./recipe-submission-form.helpers"

type RecipeSubmissionFormProps = {
  cuisines: ReadonlyArray<Cuisine>
  units: ReadonlyArray<Unit>
}

type SubmittedRecipe = { slug: string; title: string }

const RecipeSubmissionFormInner = ({
  cuisines,
  units,
}: RecipeSubmissionFormProps) => {
  const [serverError, setServerError] = useState<string | undefined>()
  const [submitted, setSubmitted] = useState<SubmittedRecipe | undefined>()
  const [heroImage, setHeroImage] = useState<File | undefined>()

  const cuisineOptions = cuisines.map((c) => ({
    value: String(c.id),
    label: c.name,
  }))
  const unitOptions = units.map((u) => ({
    value: String(u.id),
    label: `${u.name} (${u.abbreviation})`,
  }))

  const buildSubmitPayload = (value: RecipeSubmissionFormValues) => ({
    title: value.title,
    description: value.description || undefined,
    cuisine: value.cuisine || undefined,
    course: (value.course || undefined) as Course | undefined,
    difficulty: (value.difficulty || undefined) as Difficulty | undefined,
    dietaryTags:
      value.dietaryTags.length > 0
        ? (value.dietaryTags as Array<DietaryTag>)
        : undefined,
    prepTime: parseOptionalNumber(value.prepTime),
    cookTime: parseOptionalNumber(value.cookTime),
    yield:
      value.yieldQuantity || value.yieldUnit
        ? {
            quantity: parseOptionalNumber(value.yieldQuantity),
            unit: value.yieldUnit || undefined,
          }
        : undefined,
    ingredientGroups: value.ingredientGroups.map((group) => ({
      groupLabel: group.groupLabel || undefined,
      ingredients: group.ingredients.map((i) => ({
        name: i.name,
        quantity: Number(i.quantity),
        unit: i.unit,
        prepNote: i.prepNote || undefined,
      })),
    })),
    instructionGroups: value.instructionGroups.map((group) => ({
      groupLabel: group.groupLabel || undefined,
      steps: group.steps.map((s) => ({
        description: s.description,
        timerMinutes:
          s.timerMinutes === undefined ? undefined : Number(s.timerMinutes),
      })),
    })),
  })

  const form = useRecipeForm({
    onSubmit: async (value) => {
      setServerError(undefined)
      const data = buildSubmitPayload(value)

      const formData = new FormData()
      formData.set("data", JSON.stringify(data))
      if (heroImage) {
        formData.set("heroImage", heroImage)
        formData.set("heroImageAlt", value.heroImageAlt ?? "")
      }

      const result = await submitRecipeAction(formData)
      match(result)
        .with({ status: "error" }, ({ message }) => {
          setServerError(message)
        })
        .with({ status: "success" }, ({ data }) => {
          setSubmitted({ slug: data.slug, title: value.title })
        })
        .exhaustive()
    },
  })

  if (submitted) {
    return (
      <div className="space-y-4 rounded-md border border-border bg-surface p-6">
        <h2 className="font-display text-heading-md text-text-primary">
          Submitted for review
        </h2>
        <p className="text-body text-text-secondary">
          Thanks for sharing <span className="italic">{submitted.title}</span>.
          A chef will review it before it&apos;s published.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            nativeButton={false}
            render={
              <Link href={`/recipes/${submitted.slug}?preview=draft`}>
                Preview submission
              </Link>
            }
            variant="secondary"
          />
          <Button
            onClick={() => {
              setSubmitted(undefined)
              setHeroImage(undefined)
              form.reset()
            }}
          >
            Submit another recipe
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form
      className="flex flex-col gap-10"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <RecipeMetaFields cuisineOptions={cuisineOptions} form={form} />

      <HeroImageField
        form={form}
        heroImage={heroImage}
        onHeroImageChange={setHeroImage}
      />

      <DietaryTagsField form={form} />

      <section className="flex flex-col gap-6">
        <h2 className="font-display text-heading-md text-text-primary">
          Ingredients
        </h2>
        <IngredientGroupsField form={form} unitOptions={unitOptions} />
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="font-display text-heading-md text-text-primary">
          Instructions
        </h2>
        <InstructionGroupsField form={form} />
      </section>

      {serverError && (
        <p
          aria-live="polite"
          className="font-sans text-body-sm text-destructive"
          role="alert"
        >
          {serverError}
        </p>
      )}

      <form.Subscribe
        selector={(state) => ({
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
        })}
      >
        {({ canSubmit, isSubmitting }) => (
          <Button disabled={!canSubmit || isSubmitting} type="submit">
            {isSubmitting ? "Submitting…" : "Submit recipe"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}

export const RecipeSubmissionForm = (props: RecipeSubmissionFormProps) => (
  <ErrorBoundary
    fallbackRender={({ resetErrorBoundary }) => (
      <WidgetErrorFallback
        description="We couldn't load the submission form. Try again to reload it without leaving the page."
        resetErrorBoundary={resetErrorBoundary}
        title="Couldn't load the submission form"
      />
    )}
    onError={(error) => captureException(error)}
  >
    <RecipeSubmissionFormInner {...props} />
  </ErrorBoundary>
)
