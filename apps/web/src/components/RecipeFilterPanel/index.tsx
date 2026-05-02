"use client"

import { Button } from "@mise/ui/components/Button"
import { Checkbox } from "@mise/ui/components/Checkbox"
import { Label } from "@mise/ui/components/Label"
import { Select } from "@mise/ui/components/Select"
import type { ReactNode } from "react"

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
  courseOptions: ReadonlyArray<FilterOption>
  cuisineOptions: ReadonlyArray<FilterOption>
  difficultyOptions: ReadonlyArray<FilterOption>
  dietaryTagOptions: ReadonlyArray<FilterOption>
  onCourseChange: (value: string) => void
  onCuisineChange: (value: string) => void
  onDifficultyChange: (value: string) => void
  onTagToggle: (tag: string) => void
  onClearAll: VoidFunction
  activeCount: number
  headerAction?: ReactNode
}

export const RecipeFilterPanel = ({
  courseFilter,
  cuisineFilter,
  difficultyFilter,
  tagsFilter,
  courseOptions,
  cuisineOptions,
  difficultyOptions,
  dietaryTagOptions,
  onCourseChange,
  onCuisineChange,
  onDifficultyChange,
  onTagToggle,
  onClearAll,
  activeCount,
  headerAction,
}: RecipeFilterPanelProps) => (
  <div className="flex flex-col gap-6">
    <div className="flex items-center justify-between">
      <span className="font-sans text-label text-text-secondary uppercase tracking-widest">
        Filters
      </span>
      {headerAction}
    </div>

    {activeCount > 0 && (
      <Button
        className="-ml-2 self-start"
        onClick={onClearAll}
        size="sm"
        type="button"
        variant="ghost"
      >
        Clear all filters
      </Button>
    )}

    <div className="flex flex-col gap-5">
      {courseOptions.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label>Course</Label>
          <Select
            onValueChange={(v) => onCourseChange(v as string)}
            options={[
              { label: "All courses", value: "" },
              ...courseOptions.map((o) => ({
                label: `${o.label} (${o.count})`,
                value: o.value,
              })),
            ]}
            placeholder="All courses"
            value={courseFilter || ""}
          />
        </div>
      )}

      {cuisineOptions.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label>Cuisine</Label>
          <Select
            onValueChange={(v) => onCuisineChange(v as string)}
            options={[
              { label: "All cuisines", value: "" },
              ...cuisineOptions.map((o) => ({
                label: `${o.label} (${o.count})`,
                value: o.value,
              })),
            ]}
            placeholder="All cuisines"
            value={cuisineFilter || ""}
          />
        </div>
      )}

      {difficultyOptions.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label>Difficulty</Label>
          <Select
            onValueChange={(v) => onDifficultyChange(v as string)}
            options={[
              { label: "All difficulties", value: "" },
              ...difficultyOptions.map((o) => ({
                label: `${o.label} (${o.count})`,
                value: o.value,
              })),
            ]}
            placeholder="All difficulties"
            value={difficultyFilter || ""}
          />
        </div>
      )}

      {dietaryTagOptions.length > 0 && (
        <div className="flex flex-col gap-3">
          <Label>Dietary</Label>
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
