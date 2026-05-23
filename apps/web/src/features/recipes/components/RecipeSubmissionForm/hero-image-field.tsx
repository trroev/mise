"use client"

import { Field } from "@mise/ui/components/Field"
import { Input } from "@mise/ui/components/Input"
import { Label } from "@mise/ui/components/Label"
import type { RecipeForm } from "./recipe-submission-form.helpers"

type HeroImageFieldProps = {
  form: RecipeForm
  heroImage: File | undefined
  onHeroImageChange: (file: File | undefined) => void
}

export const HeroImageField = ({
  form,
  heroImage,
  onHeroImageChange,
}: HeroImageFieldProps) => (
  <>
    <div className="flex flex-col gap-2">
      <Label htmlFor="heroImage">Hero image</Label>
      <input
        accept="image/*"
        className="font-sans text-body-sm text-text-secondary"
        id="heroImage"
        name="heroImage"
        onChange={(e) => onHeroImageChange(e.target.files?.[0])}
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
  </>
)
