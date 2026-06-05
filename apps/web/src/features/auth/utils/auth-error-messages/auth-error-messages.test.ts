import { describe, expect, it } from "vitest"
import {
  signInErrorMessage,
  signUpErrorMessage,
  toSignInErrorCode,
  toSignUpErrorCode,
  toVerifyEmailErrorCode,
  verifyEmailErrorMessage,
} from "./index"

describe("toSignInErrorCode", () => {
  it("returns known codes unchanged", () => {
    expect(toSignInErrorCode("EMAIL_NOT_VERIFIED")).toBe("EMAIL_NOT_VERIFIED")
    expect(toSignInErrorCode("INVALID_PASSWORD")).toBe("INVALID_PASSWORD")
  })

  it("maps unknown or missing codes to UNKNOWN", () => {
    expect(toSignInErrorCode("SOMETHING_ELSE")).toBe("UNKNOWN")
    expect(toSignInErrorCode(undefined)).toBe("UNKNOWN")
  })
})

describe("signInErrorMessage", () => {
  it("maps every code to a friendly message", () => {
    expect(signInErrorMessage("INVALID_EMAIL_OR_PASSWORD")).toBe(
      "The email or password you entered is incorrect."
    )
    expect(signInErrorMessage("USER_NOT_FOUND")).toBe(
      "No account found for that email."
    )
    expect(signInErrorMessage("EMAIL_NOT_VERIFIED")).toBe(
      "Please verify your email before signing in."
    )
    expect(signInErrorMessage("UNKNOWN")).toBe(
      "Sign in failed. Please try again."
    )
  })
})

describe("toSignUpErrorCode", () => {
  it("returns known codes unchanged and falls back to UNKNOWN", () => {
    expect(toSignUpErrorCode("USER_ALREADY_EXISTS")).toBe("USER_ALREADY_EXISTS")
    expect(toSignUpErrorCode("nope")).toBe("UNKNOWN")
  })
})

describe("signUpErrorMessage", () => {
  it("maps every code to a friendly message", () => {
    expect(signUpErrorMessage("USER_ALREADY_EXISTS")).toBe(
      "An account with that email already exists."
    )
    expect(signUpErrorMessage("PASSWORD_TOO_SHORT")).toBe(
      "Password must be at least 8 characters."
    )
    expect(signUpErrorMessage("INVALID_EMAIL")).toBe(
      "Enter a valid email address."
    )
    expect(signUpErrorMessage("UNKNOWN")).toBe(
      "Sign up failed. Please try again."
    )
  })
})

describe("toVerifyEmailErrorCode", () => {
  it("returns known codes unchanged and falls back to UNKNOWN", () => {
    expect(toVerifyEmailErrorCode("TOKEN_EXPIRED")).toBe("TOKEN_EXPIRED")
    expect(toVerifyEmailErrorCode(undefined)).toBe("UNKNOWN")
  })
})

describe("verifyEmailErrorMessage", () => {
  it("maps every code to a friendly message", () => {
    expect(verifyEmailErrorMessage("TOKEN_EXPIRED")).toContain("expired")
    expect(verifyEmailErrorMessage("INVALID_TOKEN")).toContain("invalid")
    expect(verifyEmailErrorMessage("USER_NOT_FOUND")).toContain(
      "couldn't find an account"
    )
    expect(verifyEmailErrorMessage("INVALID_USER")).toContain(
      "different account"
    )
    expect(verifyEmailErrorMessage("UNKNOWN")).toContain("couldn't verify")
  })
})
