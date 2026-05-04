"use client"

import {
  COURSE_LABELS,
  DIETARY_TAG_LABELS,
  DIFFICULTY_LABELS,
} from "@mise/features/utils/recipeLabels"
import type { Recipe } from "@mise/payload/payload-types"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo } from "react"
import { match, P } from "ts-pattern"
import {
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
  timeRangeFilter: string
  currentPage: number
  courseOptions: Array<FilterOption>
  cuisineOptions: Array<FilterOption>
  difficultyOptions: Array<FilterOption>
  dietaryTagOptions: Array<FilterOption>
  activeFilterCount: number
  updateFilterParam: (key: string, value: string | null) => void
  clearAllFilters: () => void
  goToPage: (page: number) => void
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
  const timeRangeFilter = searchParams.get("time") ?? ""
  const currentPage = Math.max(1, Number(searchParams.get("page") ?? "1"))

  const activeFilterCount = [
    courseFilter,
    cuisineFilter,
    difficultyFilter,
    timeRangeFilter,
    ...tagsFilter,
  ].filter(Boolean).length

  const updateFilterParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    match(value)
      .with(P.string.minLength(1), (v) => params.set(key, v))
      .otherwise(() => params.delete(key))
    params.delete("page")
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("course")
    params.delete("cuisine")
    params.delete("difficulty")
    params.delete("tags")
    params.delete("time")
    params.delete("page")
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page <= 1) {
      params.delete("page")
    } else {
      params.set("page", page.toString())
    }
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
    timeRangeFilter,
    currentPage,
    courseOptions,
    cuisineOptions,
    difficultyOptions,
    dietaryTagOptions,
    activeFilterCount,
    updateFilterParam,
    clearAllFilters,
    goToPage,
  }
}
