"use client"

import type { Recipe } from "@mise/payload/payload-types"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo } from "react"
import { match, P } from "ts-pattern"
import {
  COURSE_LABELS,
  DIETARY_TAG_LABELS,
  DIFFICULTY_LABELS,
  DIFFICULTY_ORDER,
  getCuisineId,
  getCuisineName,
} from "./recipe-search.helpers"

type Course = NonNullable<Recipe["course"]>
type Difficulty = NonNullable<Recipe["difficulty"]>
type DietaryTag = NonNullable<Recipe["dietaryTags"]>[number]

export type FilterOption = {
  value: string
  label: string
  count: number
}

export type UseRecipeFiltersReturn = {
  courseFilter: string
  cuisineFilter: string
  difficultyFilter: string
  tagsFilter: Array<string>
  courseOptions: Array<FilterOption>
  cuisineOptions: Array<FilterOption>
  difficultyOptions: Array<FilterOption>
  dietaryTagOptions: Array<FilterOption>
  activeFilterCount: number
  updateFilterParam: (key: string, value: string | null) => void
  clearAllFilters: () => void
}

export const useRecipeFilters = (
  recipes: Array<Recipe>
): UseRecipeFiltersReturn => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const courseFilter = searchParams.get("course") ?? ""
  const cuisineFilter = searchParams.get("cuisine") ?? ""
  const difficultyFilter = searchParams.get("difficulty") ?? ""
  const tagsFilter = useMemo(
    () => searchParams.get("tags")?.split(",").filter(Boolean) ?? [],
    [searchParams]
  )

  const activeFilterCount = [
    courseFilter,
    cuisineFilter,
    difficultyFilter,
    ...tagsFilter,
  ].filter(Boolean).length

  const updateFilterParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    match(value)
      .with(P.string.minLength(1), (v) => params.set(key, v))
      .otherwise(() => params.delete(key))
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("course")
    params.delete("cuisine")
    params.delete("difficulty")
    params.delete("tags")
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const courseOptions = useMemo(() => {
    const counts: Partial<Record<Course, number>> = {}
    for (const recipe of recipes) {
      if (recipe.course) {
        counts[recipe.course] = (counts[recipe.course] ?? 0) + 1
      }
    }
    return Object.entries(counts)
      .map(([value, count]) => ({
        value,
        label: COURSE_LABELS[value as Course],
        count: count ?? 0,
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [recipes])

  const cuisineOptions = useMemo(() => {
    const seen = new Map<string, { label: string; count: number }>()
    for (const recipe of recipes) {
      const id = getCuisineId(recipe.cuisine)
      if (id) {
        const entry = seen.get(id)
        if (entry) {
          entry.count += 1
        } else {
          seen.set(id, {
            label: getCuisineName(recipe.cuisine) ?? id,
            count: 1,
          })
        }
      }
    }
    return Array.from(seen.entries())
      .map(([value, { label, count }]) => ({ value, label, count }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [recipes])

  const difficultyOptions = useMemo(() => {
    const counts: Partial<Record<Difficulty, number>> = {}
    for (const recipe of recipes) {
      if (recipe.difficulty) {
        counts[recipe.difficulty] = (counts[recipe.difficulty] ?? 0) + 1
      }
    }
    return Object.entries(counts)
      .map(([value, count]) => ({
        value,
        label: DIFFICULTY_LABELS[value as Difficulty],
        count: count ?? 0,
      }))
      .sort(
        (a, b) =>
          DIFFICULTY_ORDER.indexOf(a.value as Difficulty) -
          DIFFICULTY_ORDER.indexOf(b.value as Difficulty)
      )
  }, [recipes])

  const dietaryTagOptions = useMemo(() => {
    const counts: Partial<Record<DietaryTag, number>> = {}
    for (const recipe of recipes) {
      for (const tag of recipe.dietaryTags ?? []) {
        counts[tag] = (counts[tag] ?? 0) + 1
      }
    }
    return Object.entries(counts)
      .map(([value, count]) => ({
        value,
        label: DIETARY_TAG_LABELS[value as DietaryTag],
        count: count ?? 0,
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [recipes])

  return {
    courseFilter,
    cuisineFilter,
    difficultyFilter,
    tagsFilter,
    courseOptions,
    cuisineOptions,
    difficultyOptions,
    dietaryTagOptions,
    activeFilterCount,
    updateFilterParam,
    clearAllFilters,
  }
}
