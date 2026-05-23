"use client"

import { Field } from "@mise/ui/components/Field"
import { Input } from "@mise/ui/components/Input"
import { Select } from "@mise/ui/components/Select"
import { Textarea } from "@mise/ui/components/Textarea"
import {
  COURSE_OPTIONS,
  DIFFICULTY_OPTIONS,
  type RecipeForm,
} from "./recipe-submission-form.helpers"

type SelectOption = { value: string; label: string }

type RecipeMetaFieldsProps = {
  form: RecipeForm
  cuisineOptions: ReadonlyArray<SelectOption>
}

export const RecipeMetaFields = ({
  form,
  cuisineOptions,
}: RecipeMetaFieldsProps) => (
  <>
    <section className="flex flex-col gap-6">
      <h2 className="font-display text-heading-md text-text-primary">Basics</h2>
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
          <Field hint="A short blurb describing the dish." label="Description">
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
  </>
)
