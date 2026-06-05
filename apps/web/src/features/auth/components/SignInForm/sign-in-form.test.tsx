// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { renderWithProviders, userEvent } from "@mise/testing/render"
import { cleanup, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { signInEmail, resendVerificationEmailAction, nav } = vi.hoisted(() => ({
  signInEmail: vi.fn(),
  resendVerificationEmailAction: vi.fn(),
  nav: {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    pathname: "/sign-in",
    searchParams: new URLSearchParams(),
  },
}))

vi.mock("@mise/auth/client", () => ({
  authClient: {
    useSession: () => ({ data: null, isPending: true }),
    signIn: { email: signInEmail },
  },
}))

vi.mock("~/features/auth/actions/resend-verification-email", () => ({
  resendVerificationEmailAction,
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

const { SignInForm } = await import("./sign-in-form")

beforeEach(() => {
  signInEmail.mockReset()
  resendVerificationEmailAction.mockReset()
  nav.push.mockReset()
  nav.refresh.mockReset()
})

afterEach(() => {
  cleanup()
})

describe("SignInForm", () => {
  it("submits valid credentials and redirects to the default callback", async () => {
    signInEmail.mockResolvedValueOnce({ data: {}, error: null })
    const user = userEvent.setup()

    renderWithProviders(<SignInForm />)

    await user.type(screen.getByLabelText("Email"), "chef@example.com")
    await user.type(screen.getByLabelText("Password"), "hunter22")
    await user.click(screen.getByRole("button", { name: "Sign in" }))

    await waitFor(() => {
      expect(signInEmail).toHaveBeenCalledWith({
        email: "chef@example.com",
        password: "hunter22",
      })
    })
    expect(nav.push).toHaveBeenCalledWith("/")
    expect(nav.refresh).toHaveBeenCalled()
  })

  it("shows the inline email error when the email is invalid", async () => {
    const user = userEvent.setup()
    renderWithProviders(<SignInForm />)

    const emailField = screen.getByLabelText("Email")
    await user.type(emailField, "not-an-email")
    await user.tab()

    expect(
      await screen.findByText("Enter a valid email address.")
    ).toBeInTheDocument()
    expect(signInEmail).not.toHaveBeenCalled()
  })

  it("offers to resend the verification email when the account is unverified", async () => {
    signInEmail.mockResolvedValueOnce({
      data: null,
      error: { code: "EMAIL_NOT_VERIFIED", message: "Email not verified" },
    })
    resendVerificationEmailAction.mockResolvedValueOnce({
      status: "success",
      data: undefined,
    })
    const user = userEvent.setup()

    renderWithProviders(<SignInForm />)

    await user.type(screen.getByLabelText("Email"), "chef@example.com")
    await user.type(screen.getByLabelText("Password"), "hunter22")
    await user.click(screen.getByRole("button", { name: "Sign in" }))

    expect(
      await screen.findByText("Please verify your email before signing in.")
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole("button", { name: "Resend verification email" })
    )
    await waitFor(() => {
      expect(resendVerificationEmailAction).toHaveBeenCalledWith(
        "chef@example.com"
      )
    })
    expect(nav.push).not.toHaveBeenCalled()
  })

  it("shows a friendly fallback for unknown error codes", async () => {
    signInEmail.mockResolvedValueOnce({
      data: null,
      error: { code: "SOMETHING_NEW", message: "raw server message" },
    })
    const user = userEvent.setup()

    renderWithProviders(<SignInForm />)

    await user.type(screen.getByLabelText("Email"), "chef@example.com")
    await user.type(screen.getByLabelText("Password"), "hunter22")
    await user.click(screen.getByRole("button", { name: "Sign in" }))

    expect(
      await screen.findByText("Sign in failed. Please try again.")
    ).toBeInTheDocument()
  })
})
