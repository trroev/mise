"use client"

import { Button } from "@mise/ui/components/Button"
import { Field } from "@mise/ui/components/Field"
import { Input } from "@mise/ui/components/Input"
import { Select } from "@mise/ui/components/Select"
import { RiAddLine, RiDeleteBinLine } from "@remixicon/react"
import {
  emptyIngredient,
  emptyIngredientGroup,
  type RecipeForm,
} from "./recipe-submission-form.helpers"

type SelectOption = { value: string; label: string }

type IngredientGroupsFieldProps = {
  form: RecipeForm
  unitOptions: ReadonlyArray<SelectOption>
}

export const IngredientGroupsField = ({
  form,
  unitOptions,
}: IngredientGroupsFieldProps) => (
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
              <form.Field name={`ingredientGroups[${groupIndex}].groupLabel`}>
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
                                field.handleChange(e.target.valueAsNumber || 0)
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
                          <Field label={i === 0 ? "Prep note" : undefined}>
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
)
