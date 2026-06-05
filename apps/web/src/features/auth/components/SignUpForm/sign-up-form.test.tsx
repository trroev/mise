// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { renderWithProviders, userEvent } from "@mise/testing/render"
import { cleanup, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { signUpEmail, resendVerificationEmailAction } = vi.hoisted(() => ({
  signUpEmail: vi.fn(),
  resendVerificationEmailAction: vi.fn(),
}))

vi.mock("@mise/auth/client", () => ({
  authClient: {
    useSession: () => ({ data: null, isPending: true }),
    signUp: { email: signUpEmail },
  },
}))

vi.mock("~/features/auth/actions/resend-verification-email", () => ({
  resendVerificationEmailAction,
}))

const { SignUpForm } = await import("./sign-up-form")

const EMAIL_SENT_PATTERN = /Email sent/

const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText("Name"), "Trevor")
  await user.type(screen.getByLabelText("Email"), "chef@example.com")
  await user.type(screen.getByLabelText("Password"), "hunter2222")
  await user.type(screen.getByLabelText("Confirm password"), "hunter2222")
}

beforeEach(() => {
  signUpEmail.mockReset()
  resendVerificationEmailAction.mockReset()
})

afterEach(() => {
  cleanup()
})

describe("SignUpForm", () => {
  it("shows the check-your-email panel instead of signing in after sign-up", async () => {
    signUpEmail.mockResolvedValueOnce({ data: {}, error: null })
    const user = userEvent.setup()

    renderWithProviders(<SignUpForm />)

    await fillForm(user)
    await user.click(screen.getByRole("button", { name: "Create account" }))

    expect(
      await screen.findByRole("heading", { name: "Check your email" })
    ).toBeInTheDocument()
    expect(screen.getByText("chef@example.com")).toBeInTheDocument()
    expect(signUpEmail).toHaveBeenCalledWith({
      name: "Trevor",
      email: "chef@example.com",
      password: "hunter2222",
      callbackURL: "/verify-email",
    })
  })

  it("resends the verification email from the check-your-email panel", async () => {
    signUpEmail.mockResolvedValueOnce({ data: {}, error: null })
    resendVerificationEmailAction.mockResolvedValueOnce({
      status: "success",
      data: undefined,
    })
    const user = userEvent.setup()

    renderWithProviders(<SignUpForm />)

    await fillForm(user)
    await user.click(screen.getByRole("button", { name: "Create account" }))
    await user.click(
      await screen.findByRole("button", { name: "Resend verification email" })
    )

    await waitFor(() => {
      expect(resendVerificationEmailAction).toHaveBeenCalledWith(
        "chef@example.com"
      )
    })
    expect(
      await screen.findByRole("button", { name: EMAIL_SENT_PATTERN })
    ).toBeDisabled()
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
    expect(
      screen.queryByRole("heading", { name: "Check your email" })
    ).not.toBeInTheDocument()
  })
})
