// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { renderWithProviders, userEvent } from "@mise/testing/render"
import { cleanup, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { signUpEmail, nav } = vi.hoisted(() => ({
  signUpEmail: vi.fn(),
  nav: {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    pathname: "/sign-up",
    searchParams: new URLSearchParams(),
  },
}))

vi.mock("@mise/auth/client", () => ({
  authClient: {
    useSession: () => ({ data: null, isPending: true }),
    signUp: { email: signUpEmail },
  },
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

const { SignUpForm } = await import("./sign-up-form")

const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText("Name"), "Trevor")
  await user.type(screen.getByLabelText("Email"), "chef@example.com")
  await user.type(screen.getByLabelText("Password"), "hunter2222")
  await user.type(screen.getByLabelText("Confirm password"), "hunter2222")
}

beforeEach(() => {
  signUpEmail.mockReset()
  nav.push.mockReset()
  nav.refresh.mockReset()
})

afterEach(() => {
  cleanup()
})

describe("SignUpForm", () => {
  it("signs up and redirects to the default callback without email verification", async () => {
    signUpEmail.mockResolvedValueOnce({ data: {}, error: null })
    const user = userEvent.setup()

    renderWithProviders(<SignUpForm />)

    await fillForm(user)
    await user.click(screen.getByRole("button", { name: "Create account" }))

    await waitFor(() => {
      expect(signUpEmail).toHaveBeenCalledWith({
        name: "Trevor",
        email: "chef@example.com",
        password: "hunter2222",
      })
    })
    expect(nav.push).toHaveBeenCalledWith("/")
    expect(nav.refresh).toHaveBeenCalled()
    expect(
      screen.queryByRole("heading", { name: "Check your email" })
    ).not.toBeInTheDocument()
  })

  it("shows a friendly error when the email is already registered", async () => {
    signUpEmail.mockResolvedValueOnce({
      data: null,
      error: { code: "USER_ALREADY_EXISTS", message: "User already exists" },
    })
    const user = userEvent.setup()

    renderWithProviders(<SignUpForm />)

    await fillForm(user)
    await user.click(screen.getByRole("button", { name: "Create account" }))

    expect(
      await screen.findByText("An account with that email already exists.")
    ).toBeInTheDocument()
    expect(nav.push).not.toHaveBeenCalled()
  })
})
