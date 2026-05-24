// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import {
  type ChecklistStorageKey,
  useChecklistState,
} from "./use-checklist-state"

const KEY: ChecklistStorageKey = "checklist:risotto:4:metric"

describe("useChecklistState", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  it("returns an empty set when nothing is stored", () => {
    const { result } = renderHook(() => useChecklistState({ storageKey: KEY }))
    expect(result.current.checked.size).toBe(0)
  })

  it("hydrates from localStorage on mount (no flash)", () => {
    window.localStorage.setItem(KEY, JSON.stringify(["a", "b"]))
    const { result } = renderHook(() => useChecklistState({ storageKey: KEY }))
    expect(Array.from(result.current.checked).sort()).toEqual(["a", "b"])
  })

  it("toggles ids on and off and persists", () => {
    const { result } = renderHook(() => useChecklistState({ storageKey: KEY }))

    act(() => {
      result.current.toggle("ing-1")
    })
    expect(result.current.checked.has("ing-1")).toBe(true)
    expect(JSON.parse(window.localStorage.getItem(KEY) ?? "[]")).toEqual([
      "ing-1",
    ])

    act(() => {
      result.current.toggle("ing-1")
    })
    expect(result.current.checked.has("ing-1")).toBe(false)
    // empty state removes the key
    expect(window.localStorage.getItem(KEY)).toBeNull()
  })

  it("reset clears state and storage", () => {
    window.localStorage.setItem(KEY, JSON.stringify(["a", "b"]))
    const { result } = renderHook(() => useChecklistState({ storageKey: KEY }))

    act(() => {
      result.current.reset()
    })

    expect(result.current.checked.size).toBe(0)
    expect(window.localStorage.getItem(KEY)).toBeNull()
  })

  it("re-hydrates when the storage key changes (yield/units toggle)", () => {
    const KEY_2: ChecklistStorageKey = "checklist:risotto:8:us"
    window.localStorage.setItem(KEY, JSON.stringify(["a"]))
    window.localStorage.setItem(KEY_2, JSON.stringify(["x", "y"]))

    const { result, rerender } = renderHook<
      ReturnType<typeof useChecklistState>,
      { storageKey: ChecklistStorageKey }
    >(({ storageKey }) => useChecklistState({ storageKey }), {
      initialProps: { storageKey: KEY },
    })
    expect(Array.from(result.current.checked)).toEqual(["a"])

    rerender({ storageKey: KEY_2 })
    expect(Array.from(result.current.checked).sort()).toEqual(["x", "y"])
  })

  it("honors the initial option when storage is empty", () => {
    const { result } = renderHook(() =>
      useChecklistState({ storageKey: KEY, initial: ["seed"] })
    )
    expect(result.current.checked.has("seed")).toBe(true)
  })

  it("ignores corrupt JSON in localStorage", () => {
    window.localStorage.setItem(KEY, "{not json")
    const { result } = renderHook(() => useChecklistState({ storageKey: KEY }))
    expect(result.current.checked.size).toBe(0)
  })
})
