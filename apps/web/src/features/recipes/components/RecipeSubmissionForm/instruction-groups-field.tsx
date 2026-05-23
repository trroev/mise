"use client"

import { Button } from "@mise/ui/components/Button"
import { Field } from "@mise/ui/components/Field"
import { Input } from "@mise/ui/components/Input"
import { Textarea } from "@mise/ui/components/Textarea"
import { RiAddLine, RiDeleteBinLine } from "@remixicon/react"
import {
  emptyInstructionGroup,
  emptyStep,
  type RecipeForm,
} from "./recipe-submission-form.helpers"

type InstructionGroupsFieldProps = {
  form: RecipeForm
}

export const InstructionGroupsField = ({
  form,
}: InstructionGroupsFieldProps) => (
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
              <form.Field name={`instructionGroups[${groupIndex}].groupLabel`}>
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
)
