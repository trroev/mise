// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import type { Recipe } from "@mise/payload/payload-types"
import { buildRecipe } from "@mise/testing/factories"
import { renderWithProviders, userEvent } from "@mise/testing/render"
import { cleanup, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { nav } = vi.hoisted(() => {
  const subscribers = new Set<() => void>()
  const state = {
    params: new URLSearchParams(),
    subscribers,
  }
  return {
    nav: {
      push: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
      replace: vi.fn((url: string) => {
        const qIdx = url.indexOf("?")
        state.params = new URLSearchParams(qIdx >= 0 ? url.slice(qIdx + 1) : "")
        for (const s of subscribers) {
          s()
        }
      }),
      state,
    },
  }
})

vi.mock("@mise/auth/client", () => ({
  authClient: { useSession: () => ({ data: null, isPending: true }) },
}))

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }))

vi.mock("next/navigation", async () => {
  const React = await import("react")
  return {
    useRouter: () => ({
      push: nav.push,
      replace: nav.replace,
      back: nav.back,
      forward: nav.forward,
      refresh: nav.refresh,
      prefetch: nav.prefetch,
    }),
    useSearchParams: () => {
      const [, setTick] = React.useState(0)
      React.useEffect(() => {
        const cb = () => setTick((n) => n + 1)
        nav.state.subscribers.add(cb)
        return () => {
          nav.state.subscribers.delete(cb)
        }
      }, [])
      return nav.state.params
    },
    usePathname: () => "/recipes",
    useParams: () => ({}),
    redirect: vi.fn(),
    notFound: vi.fn(),
  }
})

const { RecipeSearchProvider } = await import(
  "~/features/recipes/components/RecipeSearchProvider"
)
const { RecipeQueryInput } = await import(
  "~/features/recipes/components/RecipeQueryInput"
)
const { RecipeFilterPanel } = await import(
  "~/features/recipes/components/RecipeFilterPanel"
)
const { RecipeResultGrid } = await import(
  "~/features/recipes/components/RecipeResultGrid"
)

const DESSERT_OPTION_REGEX = /Dessert/
const FILTERS_ACTIVE_REGEX = /Filters, 1 active/

const recipes = [
  buildRecipe({ id: "r1", title: "Pasta Carbonara", course: "entrée" }),
  buildRecipe({ id: "r2", title: "Margherita Pizza", course: "entrée" }),
  buildRecipe({ id: "r3", title: "Tiramisu", course: "dessert" }),
] as unknown as Array<Recipe>

const renderSearch = () =>
  renderWithProviders(
    <RecipeSearchProvider recipes={recipes}>
      <RecipeQueryInput />
      <RecipeFilterPanel />
      <RecipeResultGrid />
    </RecipeSearchProvider>
  )

beforeEach(() => {
  nav.state.params = new URLSearchParams()
  nav.replace.mockClear()
})

afterEach(() => {
  cleanup()
})

describe("RecipeSearch", () => {
  it("filters visible results and updates the URL when typing a query", async () => {
    const user = userEvent.setup()
    renderSearch()

    expect(screen.getByText("Pasta Carbonara")).toBeInTheDocument()
    expect(screen.getByText("Margherita Pizza")).toBeInTheDocument()
    expect(screen.getByText("Tiramisu")).toBeInTheDocument()

    await user.type(screen.getByLabelText("Search recipes"), "Tiramisu")

    await waitFor(() => {
      expect(screen.queryByText("Pasta Carbonara")).not.toBeInTheDocument()
    })
    expect(screen.getByText("Tiramisu")).toBeInTheDocument()

    await waitFor(
      () => {
        expect(nav.replace).toHaveBeenCalled()
      },
      { timeout: 1000 }
    )
    const lastCall = nav.replace.mock.lastCall?.[0] as string
    expect(lastCall).toContain("q=Tiramisu")
  })

  it("toggles a facet, updates URL params, and surfaces the active filter chip", async () => {
    const user = userEvent.setup()
    renderSearch()

    const courseSelect = screen.getByRole("combobox", { name: "Course" })
    await user.click(courseSelect)
    await user.click(
      await screen.findByRole("option", { name: DESSERT_OPTION_REGEX })
    )

    await waitFor(() => {
      expect(nav.replace).toHaveBeenCalled()
    })
    const lastCall = nav.replace.mock.lastCall?.[0] as string
    expect(lastCall).toContain("course=dessert")

    const filtersButton = await screen.findByRole("button", {
      name: FILTERS_ACTIVE_REGEX,
    })
    expect(within(filtersButton).getByText("1")).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByText("Pasta Carbonara")).not.toBeInTheDocument()
    })
    expect(screen.getByText("Tiramisu")).toBeInTheDocument()
  })
})
