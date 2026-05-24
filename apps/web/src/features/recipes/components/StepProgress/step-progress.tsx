"use client"

import { Badge } from "@mise/ui/components/Badge"
import { cn } from "@mise/ui/utils/cn"
import { RiTimerLine } from "@remixicon/react"
import { StepProgressIndicator } from "~/features/recipes/components/StepProgressIndicator"
import {
  type StepProgressStorageKey,
  useChecklistState,
} from "~/features/recipes/hooks/use-checklist-state"

export type StepProgressStep = {
  id: string
  description: string
  timerMinutes?: number | null
}

export type StepProgressGroup = {
  id?: string | null
  groupLabel?: string | null
  steps: ReadonlyArray<StepProgressStep>
}

export type StepProgressProps = {
  groups: ReadonlyArray<StepProgressGroup>
  storageKey: StepProgressStorageKey
}

export const StepProgress = ({
  groups,
  storageKey,
}: StepProgressProps): React.ReactElement => {
  const { checked, toggle, reset } = useChecklistState({ storageKey })

  const allStepIds = groups.flatMap((g) => g.steps.map((s) => s.id))
  const total = allStepIds.length
  const completed = allStepIds.reduce(
    (n, id) => (checked.has(id) ? n + 1 : n),
    0
  )
  const hasProgress = completed > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <StepProgressIndicator completed={completed} total={total} />
        <button
          aria-hidden={!hasProgress}
          className={cn(
            "font-sans text-body-sm text-text-muted underline-offset-2 transition-opacity hover:text-text-primary hover:underline",
            !hasProgress && "pointer-events-none opacity-0"
          )}
          onClick={reset}
          tabIndex={hasProgress ? 0 : -1}
          type="button"
        >
          Reset progress
        </button>
      </div>
      <div className="space-y-8">
        {groups.map((group, gi) => (
          <div key={group.id ?? gi}>
            {group.groupLabel && (
              <h3 className="mb-4 font-medium font-sans text-body-sm text-text-muted uppercase tracking-widest">
                {group.groupLabel}
              </h3>
            )}
            <ol className="space-y-6">
              {group.steps.map((step, si) => {
                const isChecked = checked.has(step.id)
                return (
                  <li key={step.id}>
                    <button
                      aria-pressed={isChecked}
                      className={cn(
                        "-mx-2 flex w-full gap-4 rounded-md px-2 py-2 text-left transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                        isChecked && "opacity-50"
                      )}
                      onClick={() => toggle(step.id)}
                      type="button"
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "shrink-0 pt-0.5 font-display text-accent text-heading-md leading-none",
                          isChecked && "line-through"
                        )}
                      >
                        {si + 1}
                      </span>
                      <span className="flex-1 space-y-2">
                        <span
                          className={cn(
                            "block font-sans text-body text-text-primary",
                            isChecked && "line-through"
                          )}
                        >
                          {step.description}
                        </span>
                        {step.timerMinutes && (
                          <Badge
                            className="inline-flex items-center gap-1"
                            variant="muted"
                          >
                            <RiTimerLine aria-hidden="true" size={12} />
                            {step.timerMinutes} min
                          </Badge>
                        )}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>
        ))}
      </div>
    </div>
  )
}
