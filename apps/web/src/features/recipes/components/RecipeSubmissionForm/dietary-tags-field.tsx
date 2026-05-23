"use client"

import { Checkbox } from "@mise/ui/components/Checkbox"
import { Label } from "@mise/ui/components/Label"
import { DIETARY_TAGS, type RecipeForm } from "./recipe-submission-form.helpers"

type DietaryTagsFieldProps = {
  form: RecipeForm
}

export const DietaryTagsField = ({ form }: DietaryTagsFieldProps) => (
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
                      field.handleChange([...field.state.value, tag.value])
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
)
