// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import type { Cuisine, Unit } from "@mise/payload/payload-types"
import { renderWithProviders, userEvent } from "@mise/testing/render"
import { cleanup, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { submitRecipeAction, nav } = vi.hoisted(() => ({
  submitRecipeAction: vi.fn(),
  nav: {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    pathname: "/recipes/new",
    searchParams: new URLSearchParams(),
  },
}))

vi.mock("@mise/auth/client", () => ({
  authClient: { useSession: () => ({ data: null, isPending: true }) },
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: nav.push,
    replace: nav.replace,
    back: nav.back,
    forward: nav.forward,
    refresh: nav.refresh,
    prefetch: nav.prefetch,
  }),
  usePathname: () => nav.pathname,
  useSearchParams: () => nav.searchParams,
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
}))

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }))

vi.mock("~/features/recipes/actions/submit-recipe", () => ({
  submitRecipeAction,
}))

const { RecipeSubmissionForm } = await import("./recipe-submission-form")

const cuisines = [] as ReadonlyArray<Cuisine>
const units = [
  { id: "u1", name: "gram", abbreviation: "g" },
] as unknown as ReadonlyArray<Unit>

const GRAM_OPTION_REGEX = /gram/
const SUBMITTED_TITLE_REGEX = /My Dish/

beforeEach(() => {
  submitRecipeAction.mockReset()
})

afterEach(() => {
  cleanup()
})

describe("RecipeSubmissionForm", () => {
  it("submits the filled form and renders the success confirmation with a preview link", async () => {
    submitRecipeAction.mockResolvedValueOnce({
      status: "success",
      data: { id: "r1", slug: "my-dish" },
    })
    const user = userEvent.setup()

    renderWithProviders(
      <RecipeSubmissionForm cuisines={cuisines} units={units} />
    )

    await user.type(screen.getByLabelText("Title"), "My Dish")
    await user.type(screen.getByLabelText("Ingredient"), "Flour")

    await user.click(screen.getByRole("combobox", { name: "Unit" }))
    await user.click(
      await screen.findByRole("option", { name: GRAM_OPTION_REGEX })
    )

    const stepInput = document.querySelector(
      'textarea[name="instructionGroups[0].steps[0].description"]'
    ) as HTMLTextAreaElement
    await user.type(stepInput, "Mix everything together.")

    await user.click(screen.getByRole("button", { name: "Submit recipe" }))

    await waitFor(() => {
      expect(submitRecipeAction).toHaveBeenCalledTimes(1)
    })

    expect(
      await screen.findByRole("heading", { name: "Submitted for review" })
    ).toBeInTheDocument()
    const previewLink = screen.getByRole("button", {
      name: "Preview submission",
    })
    expect(previewLink.tagName).toBe("A")
    expect(previewLink).toHaveAttribute(
      "href",
      "/recipes/my-dish?preview=draft"
    )
    expect(screen.getByText(SUBMITTED_TITLE_REGEX)).toBeInTheDocument()
  })
})
