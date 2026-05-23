"use client"

import type { Cuisine, Unit } from "@mise/payload/payload-types"
import { Button } from "@mise/ui/components/Button"
import { Checkbox } from "@mise/ui/components/Checkbox"
import { Field } from "@mise/ui/components/Field"
import { Input } from "@mise/ui/components/Input"
import { Label } from "@mise/ui/components/Label"
import { Select } from "@mise/ui/components/Select"
import { Textarea } from "@mise/ui/components/Textarea"
import { RiAddLine, RiDeleteBinLine } from "@remixicon/react"
import { captureException } from "@sentry/nextjs"
import { useForm } from "@tanstack/react-form"
import Link from "next/link"
import { useState } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { WidgetErrorFallback } from "~/components/WidgetErrorFallback"
import { submitRecipeAction } from "~/features/recipes/actions/submit-recipe"
import {
  COURSE_OPTIONS,
  type Course,
  DIETARY_TAGS,
  DIFFICULTY_OPTIONS,
  type DietaryTag,
  type Difficulty,
  emptyIngredient,
  emptyIngredientGroup,
  emptyInstructionGroup,
  emptyStep,
  parseOptionalNumber,
  type RecipeSubmissionFormValues,
  recipeSubmissionFormSchema,
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

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      heroImageAlt: "",
      cuisine: "",
      course: "",
      difficulty: "",
      dietaryTags: [] as Array<string>,
      prepTime: "",
      cookTime: "",
      yieldQuantity: "",
      yieldUnit: "",
      ingredientGroups: [emptyIngredientGroup()],
      instructionGroups: [emptyInstructionGroup()],
    } satisfies RecipeSubmissionFormValues,
    validators: { onChange: recipeSubmissionFormSchema },
    onSubmit: async ({ value }) => {
      setServerError(undefined)

      const data = {
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
      }

      const formData = new FormData()
      formData.set("data", JSON.stringify(data))
      if (heroImage) {
        formData.set("heroImage", heroImage)
        formData.set("heroImageAlt", value.heroImageAlt ?? "")
      }

      const result = await submitRecipeAction(formData)
      if (result.status === "error") {
        setServerError(result.message)
        return
      }
      setSubmitted({ slug: result.slug, title: value.title })
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
      <section className="flex flex-col gap-6">
        <h2 className="font-display text-heading-md text-text-primary">
          Basics
        </h2>
        <form.Field name="title">
          {(field) => (
            <Field
              error={
                field.state.meta.isTouched
                  ? field.state.meta.errors[0]?.message
                  : undefined
              }
              label="Title"
            >
              <Input
                id="title"
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                required
                type="text"
                value={field.state.value}
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <Field
              hint="A short blurb describing the dish."
              label="Description"
            >
              <Textarea
                id="description"
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                value={field.state.value}
              />
            </Field>
          )}
        </form.Field>

        <div className="flex flex-col gap-2">
          <Label htmlFor="heroImage">Hero image</Label>
          <input
            accept="image/*"
            className="font-sans text-body-sm text-text-secondary"
            id="heroImage"
            name="heroImage"
            onChange={(e) => setHeroImage(e.target.files?.[0])}
            type="file"
          />
          <p className="font-sans text-body-sm text-text-muted">
            JPEG or PNG, up to 8 MB.
          </p>
        </div>

        {heroImage && (
          <form.Field name="heroImageAlt">
            {(field) => (
              <Field
                hint="Describe the image for screen readers."
                label="Hero image alt text"
              >
                <Input
                  id="heroImageAlt"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                  type="text"
                  value={field.state.value}
                />
              </Field>
            )}
          </form.Field>
        )}
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="font-display text-heading-md text-text-primary">
          Classification
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field name="cuisine">
            {(field) => (
              <Field label="Cuisine">
                <Select
                  id="cuisine"
                  onValueChange={(value) => field.handleChange(value as string)}
                  options={cuisineOptions}
                  placeholder="Select cuisine…"
                  value={field.state.value}
                />
              </Field>
            )}
          </form.Field>
          <form.Field name="course">
            {(field) => (
              <Field label="Course">
                <Select
                  id="course"
                  onValueChange={(value) => field.handleChange(value as string)}
                  options={COURSE_OPTIONS}
                  placeholder="Select course…"
                  value={field.state.value}
                />
              </Field>
            )}
          </form.Field>
          <form.Field name="difficulty">
            {(field) => (
              <Field label="Difficulty">
                <Select
                  id="difficulty"
                  onValueChange={(value) => field.handleChange(value as string)}
                  options={DIFFICULTY_OPTIONS}
                  placeholder="Select difficulty…"
                  value={field.state.value}
                />
              </Field>
            )}
          </form.Field>
        </div>

        <form.Field mode="array" name="dietaryTags">
          {(field) => (
            <fieldset className="flex flex-col gap-3">
              <legend className="font-sans text-body-sm text-text-primary">
                Dietary tags
              </legend>
              <div className="flex flex-wrap gap-4">
                {DIETARY_TAGS.map((tag) => {
                  const checked = field.state.value.includes(tag.value)
                  return (
                    <Label className="flex items-center gap-2" key={tag.value}>
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(isChecked) => {
                          if (isChecked) {
                            field.handleChange([
                              ...field.state.value,
                              tag.value,
                            ])
                          } else {
                            field.handleChange(
                              field.state.value.filter((v) => v !== tag.value)
                            )
                          }
                        }}
                      />
                      {tag.label}
                    </Label>
                  )
                })}
              </div>
            </fieldset>
          )}
        </form.Field>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="font-display text-heading-md text-text-primary">
          Timing &amp; yield
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <form.Field name="prepTime">
            {(field) => (
              <Field label="Prep time (min)">
                <Input
                  id="prepTime"
                  inputMode="numeric"
                  min={0}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="number"
                  value={field.state.value}
                />
              </Field>
            )}
          </form.Field>
          <form.Field name="cookTime">
            {(field) => (
              <Field label="Cook time (min)">
                <Input
                  id="cookTime"
                  inputMode="numeric"
                  min={0}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="number"
                  value={field.state.value}
                />
              </Field>
            )}
          </form.Field>
          <form.Field name="yieldQuantity">
            {(field) => (
              <Field label="Yield quantity">
                <Input
                  id="yieldQuantity"
                  inputMode="numeric"
                  min={0}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="number"
                  value={field.state.value}
                />
              </Field>
            )}
          </form.Field>
          <form.Field name="yieldUnit">
            {(field) => (
              <Field hint="e.g. servings, portions" label="Yield unit">
                <Input
                  id="yieldUnit"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="text"
                  value={field.state.value}
                />
              </Field>
            )}
          </form.Field>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-heading-md text-text-primary">
            Ingredients
          </h2>
        </div>
        <form.Field mode="array" name="ingredientGroups">
          {(groupsField) => (
            <div className="flex flex-col gap-6">
              {groupsField.state.value.map((_, groupIndex) => (
                <div
                  className="flex flex-col gap-4 rounded-md border border-border bg-surface p-4"
                  // biome-ignore lint/suspicious/noArrayIndexKey: groups have no stable id pre-save
                  key={`ingredient-group-${groupIndex}`}
                >
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <form.Field
                      name={`ingredientGroups[${groupIndex}].groupLabel`}
                    >
                      {(field) => (
                        <Field
                          className="flex-1"
                          hint="Optional, e.g. 'For the sauce'."
                          label={`Group ${groupIndex + 1}`}
                        >
                          <Input
                            id={`ingredientGroupLabel-${groupIndex}`}
                            name={field.name}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            type="text"
                            value={field.state.value ?? ""}
                          />
                        </Field>
                      )}
                    </form.Field>
                    {groupsField.state.value.length > 1 && (
                      <Button
                        onClick={() => groupsField.removeValue(groupIndex)}
                        size="sm"
                        variant="ghost"
                      >
                        <RiDeleteBinLine aria-hidden="true" size={14} />
                        Remove group
                      </Button>
                    )}
                  </div>

                  <form.Field
                    mode="array"
                    name={`ingredientGroups[${groupIndex}].ingredients`}
                  >
                    {(ingredientsField) => (
                      <div className="flex flex-col gap-3">
                        {ingredientsField.state.value.map((_, i) => (
                          <div
                            className="grid gap-2 sm:grid-cols-[2fr_1fr_1fr_2fr_auto] sm:items-end"
                            // biome-ignore lint/suspicious/noArrayIndexKey: rows have no stable id pre-save
                            key={`ingredient-${groupIndex}-${i}`}
                          >
                            <form.Field
                              name={`ingredientGroups[${groupIndex}].ingredients[${i}].name`}
                            >
                              {(field) => (
                                <Field
                                  error={
                                    field.state.meta.isTouched
                                      ? field.state.meta.errors[0]?.message
                                      : undefined
                                  }
                                  label={i === 0 ? "Ingredient" : undefined}
                                >
                                  <Input
                                    name={field.name}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                      field.handleChange(e.target.value)
                                    }
                                    placeholder="Tomato"
                                    type="text"
                                    value={field.state.value}
                                  />
                                </Field>
                              )}
                            </form.Field>
                            <form.Field
                              name={`ingredientGroups[${groupIndex}].ingredients[${i}].quantity`}
                            >
                              {(field) => (
                                <Field
                                  error={
                                    field.state.meta.isTouched
                                      ? field.state.meta.errors[0]?.message
                                      : undefined
                                  }
                                  label={i === 0 ? "Quantity" : undefined}
                                >
                                  <Input
                                    inputMode="decimal"
                                    min={0}
                                    name={field.name}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                      field.handleChange(
                                        e.target.valueAsNumber || 0
                                      )
                                    }
                                    step="0.01"
                                    type="number"
                                    value={field.state.value}
                                  />
                                </Field>
                              )}
                            </form.Field>
                            <form.Field
                              name={`ingredientGroups[${groupIndex}].ingredients[${i}].unit`}
                            >
                              {(field) => (
                                <Field
                                  error={
                                    field.state.meta.isTouched
                                      ? field.state.meta.errors[0]?.message
                                      : undefined
                                  }
                                  label={i === 0 ? "Unit" : undefined}
                                >
                                  <Select
                                    onValueChange={(value) =>
                                      field.handleChange(value as string)
                                    }
                                    options={unitOptions}
                                    placeholder="Unit…"
                                    value={field.state.value}
                                  />
                                </Field>
                              )}
                            </form.Field>
                            <form.Field
                              name={`ingredientGroups[${groupIndex}].ingredients[${i}].prepNote`}
                            >
                              {(field) => (
                                <Field
                                  label={i === 0 ? "Prep note" : undefined}
                                >
                                  <Input
                                    name={field.name}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                      field.handleChange(e.target.value)
                                    }
                                    placeholder="finely diced"
                                    type="text"
                                    value={field.state.value ?? ""}
                                  />
                                </Field>
                              )}
                            </form.Field>
                            {ingredientsField.state.value.length > 1 && (
                              <Button
                                aria-label="Remove ingredient"
                                onClick={() => ingredientsField.removeValue(i)}
                                size="sm"
                                variant="ghost"
                              >
                                <RiDeleteBinLine aria-hidden="true" size={14} />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          onClick={() =>
                            ingredientsField.pushValue(emptyIngredient())
                          }
                          size="sm"
                          variant="secondary"
                        >
                          <RiAddLine aria-hidden="true" size={14} />
                          Add ingredient
                        </Button>
                      </div>
                    )}
                  </form.Field>
                </div>
              ))}
              <Button
                onClick={() => groupsField.pushValue(emptyIngredientGroup())}
                variant="secondary"
              >
                <RiAddLine aria-hidden="true" size={14} />
                Add ingredient group
              </Button>
            </div>
          )}
        </form.Field>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="font-display text-heading-md text-text-primary">
          Instructions
        </h2>
        <form.Field mode="array" name="instructionGroups">
          {(groupsField) => (
            <div className="flex flex-col gap-6">
              {groupsField.state.value.map((_, groupIndex) => (
                <div
                  className="flex flex-col gap-4 rounded-md border border-border bg-surface p-4"
                  // biome-ignore lint/suspicious/noArrayIndexKey: groups have no stable id pre-save
                  key={`instruction-group-${groupIndex}`}
                >
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <form.Field
                      name={`instructionGroups[${groupIndex}].groupLabel`}
                    >
                      {(field) => (
                        <Field
                          className="flex-1"
                          hint="Optional, e.g. 'Make the dough'."
                          label={`Group ${groupIndex + 1}`}
                        >
                          <Input
                            id={`instructionGroupLabel-${groupIndex}`}
                            name={field.name}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            type="text"
                            value={field.state.value ?? ""}
                          />
                        </Field>
                      )}
                    </form.Field>
                    {groupsField.state.value.length > 1 && (
                      <Button
                        onClick={() => groupsField.removeValue(groupIndex)}
                        size="sm"
                        variant="ghost"
                      >
                        <RiDeleteBinLine aria-hidden="true" size={14} />
                        Remove group
                      </Button>
                    )}
                  </div>

                  <form.Field
                    mode="array"
                    name={`instructionGroups[${groupIndex}].steps`}
                  >
                    {(stepsField) => (
                      <div className="flex flex-col gap-3">
                        {stepsField.state.value.map((_, i) => (
                          <div
                            className="grid gap-2 sm:grid-cols-[1fr_180px_auto] sm:items-start"
                            // biome-ignore lint/suspicious/noArrayIndexKey: rows have no stable id pre-save
                            key={`step-${groupIndex}-${i}`}
                          >
                            <form.Field
                              name={`instructionGroups[${groupIndex}].steps[${i}].description`}
                            >
                              {(field) => (
                                <Field
                                  error={
                                    field.state.meta.isTouched
                                      ? field.state.meta.errors[0]?.message
                                      : undefined
                                  }
                                  label={`Step ${i + 1}`}
                                >
                                  <Textarea
                                    name={field.name}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                      field.handleChange(e.target.value)
                                    }
                                    value={field.state.value}
                                  />
                                </Field>
                              )}
                            </form.Field>
                            <form.Field
                              name={`instructionGroups[${groupIndex}].steps[${i}].timerMinutes`}
                            >
                              {(field) => (
                                <Field label="Timer (min)">
                                  <Input
                                    inputMode="numeric"
                                    min={0}
                                    name={field.name}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => {
                                      const n = e.target.valueAsNumber
                                      field.handleChange(
                                        Number.isFinite(n) ? n : undefined
                                      )
                                    }}
                                    type="number"
                                    value={field.state.value ?? ""}
                                  />
                                </Field>
                              )}
                            </form.Field>
                            {stepsField.state.value.length > 1 && (
                              <Button
                                aria-label="Remove step"
                                onClick={() => stepsField.removeValue(i)}
                                size="sm"
                                variant="ghost"
                              >
                                <RiDeleteBinLine aria-hidden="true" size={14} />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          onClick={() => stepsField.pushValue(emptyStep())}
                          size="sm"
                          variant="secondary"
                        >
                          <RiAddLine aria-hidden="true" size={14} />
                          Add step
                        </Button>
                      </div>
                    )}
                  </form.Field>
                </div>
              ))}
              <Button
                onClick={() => groupsField.pushValue(emptyInstructionGroup())}
                variant="secondary"
              >
                <RiAddLine aria-hidden="true" size={14} />
                Add instruction group
              </Button>
            </div>
          )}
        </form.Field>
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
