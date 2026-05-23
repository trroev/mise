import "@testing-library/jest-dom/vitest"

import { useSession } from "@mise/auth/session"
import { describe, expect, it, vi } from "vitest"

vi.mock("@mise/auth/client", () => ({
  authClient: {
    useSession: () => ({ data: null, isPending: true }),
  },
}))

import {
  buildCuisine,
  buildIngredientGroup,
  buildRecipe,
  buildUnit,
  buildUser,
  resetFactoryCounter,
} from "./factories"
import {
  authGetSessionHandler,
  authSignOutHandler,
  payloadListHandler,
  server,
} from "./msw"
import { renderWithProviders } from "./render"

const SessionConsumer = () => {
  const { user, isAuthenticated } = useSession()
  return (
    <div>
      <span data-testid="name">{user?.name ?? "no-user"}</span>
      <span data-testid="auth">{String(isAuthenticated)}</span>
    </div>
  )
}

describe("@mise/testing", () => {
  it("factories produce deterministic objects with overrides", () => {
    resetFactoryCounter()
    const user = buildUser({ name: "Alice" })
    const recipe = buildRecipe({ title: "Pasta" })
    const group = buildIngredientGroup()
    const cuisine = buildCuisine()
    const unit = buildUnit()

    expect(user.name).toBe("Alice")
    expect(user.email.endsWith("@example.com")).toBe(true)
    expect(recipe.title).toBe("Pasta")
    expect(recipe.ingredientGroups).toHaveLength(1)
    expect(group.ingredients[0]?.name).toBe("flour")
    expect(cuisine.slug).toBe("italian")
    expect(unit.abbreviation).toBe("g")
  })

  it("renderWithProviders mounts children inside SessionProvider", () => {
    const user = buildUser({ name: "Renderer" })
    const { getByTestId } = renderWithProviders(<SessionConsumer />, {
      initialUser: user,
    })
    expect(getByTestId("name")).toHaveTextContent("Renderer")
    expect(getByTestId("auth")).toHaveTextContent("true")
  })

  it("msw server is configured and handler factories are importable", () => {
    expect(typeof server.listen).toBe("function")
    expect(authGetSessionHandler(null)).toBeDefined()
    expect(authSignOutHandler()).toBeDefined()
    expect(payloadListHandler("recipes", [buildRecipe()])).toBeDefined()
  })
})
