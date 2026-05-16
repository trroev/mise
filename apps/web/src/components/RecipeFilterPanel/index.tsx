"use client"

import { Button } from "@mise/ui/components/Button"
import { Checkbox } from "@mise/ui/components/Checkbox"
import { Label } from "@mise/ui/components/Label"
import { Select } from "@mise/ui/components/Select"
import { cn } from "@mise/ui/utils/cn"
import type { ReactNode } from "react"
import { TIME_RANGE_OPTIONS } from "~/components/RecipeSearch/recipe-search.helpers"

type FilterOption = {
  value: string
  label: string
  count: number
}

export type RecipeFilterPanelProps = {
  courseFilter: string
  cuisineFilter: string
  difficultyFilter: string
  tagsFilter: ReadonlyArray<string>
  timeRangeFilter: string
  courseOptions: ReadonlyArray<FilterOption>
  cuisineOptions: ReadonlyArray<FilterOption>
  difficultyOptions: ReadonlyArray<FilterOption>
  dietaryTagOptions: ReadonlyArray<FilterOption>
  onCourseChange: (value: string) => void
  onCuisineChange: (value: string) => void
  onDifficultyChange: (value: string) => void
  onTagToggle: (tag: string) => void
  onTimeRangeChange: (value: string) => void
  onClearAll: VoidFunction
  activeCount: number
  headerAction?: ReactNode
}

export const RecipeFilterPanel = ({
  courseFilter,
  cuisineFilter,
  difficultyFilter,
  tagsFilter,
  timeRangeFilter,
  courseOptions,
  cuisineOptions,
  difficultyOptions,
  dietaryTagOptions,
  onCourseChange,
  onCuisineChange,
  onDifficultyChange,
  onTagToggle,
  onTimeRangeChange,
  onClearAll,
  activeCount,
  headerAction,
}: RecipeFilterPanelProps) => {
  const activeTagCount = tagsFilter.length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="font-sans text-label text-text-secondary uppercase tracking-widest">
          Filters
        </span>
        <div className="flex items-center gap-2">
          <Button
            className={cn(activeCount === 0 && "invisible")}
            onClick={onClearAll}
            size="sm"
            type="button"
            variant="outline"
          >
            Clear all
          </Button>
          {headerAction}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {courseOptions.length > 0 && (
          <div className="flex flex-col gap-2">
            <Label className={courseFilter ? "text-accent" : undefined}>
              Course
            </Label>
            <Select
              aria-label="Course"
              onValueChange={(v) => onCourseChange(v as string)}
              options={[
                { label: "All courses", value: "" },
                ...courseOptions.map((o) => ({
                  label: `${o.label} (${o.count})`,
                  value: o.value,
                })),
              ]}
              placeholder="All courses"
              triggerClassName={
                courseFilter ? "border-accent text-accent" : undefined
              }
              value={courseFilter || ""}
            />
          </div>
        )}

        {cuisineOptions.length > 0 && (
          <div className="flex flex-col gap-2">
            <Label className={cuisineFilter ? "text-accent" : undefined}>
              Cuisine
            </Label>
            <Select
              aria-label="Cuisine"
              onValueChange={(v) => onCuisineChange(v as string)}
              options={[
                { label: "All cuisines", value: "" },
                ...cuisineOptions.map((o) => ({
                  label: `${o.label} (${o.count})`,
                  value: o.value,
                })),
              ]}
              placeholder="All cuisines"
              triggerClassName={
                cuisineFilter ? "border-accent text-accent" : undefined
              }
              value={cuisineFilter || ""}
            />
          </div>
        )}

        {difficultyOptions.length > 0 && (
          <div className="flex flex-col gap-2">
            <Label className={difficultyFilter ? "text-accent" : undefined}>
              Difficulty
            </Label>
            <Select
              aria-label="Difficulty"
              onValueChange={(v) => onDifficultyChange(v as string)}
              options={[
                { label: "All difficulties", value: "" },
                ...difficultyOptions.map((o) => ({
                  label: `${o.label} (${o.count})`,
                  value: o.value,
                })),
              ]}
              placeholder="All difficulties"
              triggerClassName={
                difficultyFilter ? "border-accent text-accent" : undefined
              }
              value={difficultyFilter || ""}
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label className={timeRangeFilter ? "text-accent" : undefined}>
            Total time
          </Label>
          <Select
            aria-label="Total time"
            onValueChange={(v) => onTimeRangeChange(v as string)}
            options={TIME_RANGE_OPTIONS.map((o) => ({
              label: o.label,
              value: o.value,
            }))}
            placeholder="Any time"
            triggerClassName={
              timeRangeFilter ? "border-accent text-accent" : undefined
            }
            value={timeRangeFilter ?? ""}
          />
        </div>

        {dietaryTagOptions.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-1.5">
              <Label className={activeTagCount > 0 ? "text-accent" : undefined}>
                Dietary
              </Label>
              {activeTagCount > 0 && (
                <span className="font-sans text-accent text-caption">
                  ({activeTagCount})
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2.5">
              {dietaryTagOptions.map((option) => (
                <div className="flex items-center gap-2.5" key={option.value}>
                  <Checkbox
                    checked={tagsFilter.includes(option.value)}
                    id={`tag-${option.value}`}
                    onCheckedChange={() => onTagToggle(option.value)}
                  />
                  <Label htmlFor={`tag-${option.value}`}>
                    {option.label}{" "}
                    <span className="text-text-muted">({option.count})</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
