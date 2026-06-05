// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { renderWithProviders, userEvent } from "@mise/testing/render"
import { cleanup, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { resendVerificationEmailAction } = vi.hoisted(() => ({
  resendVerificationEmailAction: vi.fn(),
}))

vi.mock("~/features/auth/actions/resend-verification-email", () => ({
  resendVerificationEmailAction,
}))

const { VerifyEmailStatus } = await import("./verify-email-status")

beforeEach(() => {
  resendVerificationEmailAction.mockReset()
})

afterEach(() => {
  cleanup()
})

describe("VerifyEmailStatus", () => {
  it("shows the success state without an error code", () => {
    renderWithProviders(<VerifyEmailStatus />)

    expect(
      screen.getByRole("heading", { name: "Email verified" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Browse recipes" })
    ).toHaveAttribute("href", "/")
  })

  it("shows the expired-link message and resends to the entered email", async () => {
    resendVerificationEmailAction.mockResolvedValueOnce({
      status: "success",
      data: undefined,
    })
    const user = userEvent.setup()

    renderWithProviders(<VerifyEmailStatus errorCode="TOKEN_EXPIRED" />)

    expect(
      screen.getByText(
        "This verification link has expired. Request a new one below."
      )
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText("Email"), "chef@example.com")
    await user.click(
      screen.getByRole("button", { name: "Resend verification email" })
    )

    await waitFor(() => {
      expect(resendVerificationEmailAction).toHaveBeenCalledWith(
        "chef@example.com"
      )
    })
  })

  it("surfaces the action error for an invalid email", async () => {
    resendVerificationEmailAction.mockResolvedValueOnce({
      status: "error",
      message: "Enter a valid email address.",
    })
    const user = userEvent.setup()

    renderWithProviders(<VerifyEmailStatus errorCode="INVALID_TOKEN" />)

    await user.click(
      screen.getByRole("button", { name: "Resend verification email" })
    )

    expect(
      await screen.findByText("Enter a valid email address.")
    ).toBeInTheDocument()
  })
})
