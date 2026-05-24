"use client"

import { cn } from "@mise/ui/utils/cn"
import {
  type ChecklistStorageKey,
  useChecklistState,
} from "~/features/recipes/hooks/use-checklist-state"

export type ChecklistIngredient = {
  id: string
  quantityLabel: string
  name: string
  prepNote?: string | null
}

export type ChecklistGroup = {
  id?: string | null
  groupLabel?: string | null
  ingredients: ReadonlyArray<ChecklistIngredient>
}

export type IngredientChecklistProps = {
  groups: ReadonlyArray<ChecklistGroup>
  storageKey: ChecklistStorageKey
}

export const IngredientChecklist = ({
  groups,
  storageKey,
}: IngredientChecklistProps) => {
  const { checked, toggle, reset } = useChecklistState({ storageKey })

  return (
    <div className="space-y-6">
      <div className="flex justify-end print:hidden">
        <button
          aria-hidden={checked.size === 0}
          className={cn(
            "font-sans text-body-sm text-text-muted underline-offset-2 transition-opacity hover:text-text-primary hover:underline",
            checked.size === 0 && "pointer-events-none opacity-0"
          )}
          onClick={reset}
          tabIndex={checked.size === 0 ? -1 : 0}
          type="button"
        >
          Reset checklist
        </button>
      </div>
      {groups.map((group, gi) => (
        <div key={group.id ?? gi}>
          {group.groupLabel && (
            <h3 className="mb-3 font-medium font-sans text-body-sm text-text-muted uppercase tracking-widest">
              {group.groupLabel}
            </h3>
          )}
          <ul className="space-y-1">
            {group.ingredients.map((ingredient) => {
              const isChecked = checked.has(ingredient.id)
              return (
                <li key={ingredient.id}>
                  <button
                    aria-pressed={isChecked}
                    className={cn(
                      "-mx-2 flex w-full items-start gap-3 rounded-md px-2 py-1.5 text-left font-sans text-body text-text-primary transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      isChecked && "text-text-muted line-through"
                    )}
                    onClick={() => toggle(ingredient.id)}
                    type="button"
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border bg-background print:hidden",
                        isChecked && "border-accent bg-accent text-background"
                      )}
                    >
                      {isChecked && (
                        <svg
                          aria-hidden="true"
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M5 13l4 4L19 7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    <span>
                      <span
                        className={cn(
                          "text-text-secondary",
                          isChecked && "text-text-muted"
                        )}
                      >
                        {ingredient.quantityLabel}
                      </span>{" "}
                      {ingredient.name}
                      {ingredient.prepNote && (
                        <span
                          className={cn(
                            "text-text-muted",
                            isChecked && "text-text-muted/70"
                          )}
                        >
                          , {ingredient.prepNote}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
