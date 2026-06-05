import { match } from "ts-pattern"

const SIGN_IN_ERROR_CODES = [
  "INVALID_EMAIL_OR_PASSWORD",
  "INVALID_PASSWORD",
  "USER_NOT_FOUND",
  "EMAIL_NOT_VERIFIED",
] as const satisfies ReadonlyArray<string>

export type SignInErrorCode = (typeof SIGN_IN_ERROR_CODES)[number] | "UNKNOWN"

export const toSignInErrorCode = (code?: string): SignInErrorCode =>
  SIGN_IN_ERROR_CODES.find((known) => known === code) ?? "UNKNOWN"

export const signInErrorMessage = (code: SignInErrorCode): string =>
  match(code)
    .with(
      "INVALID_EMAIL_OR_PASSWORD",
      "INVALID_PASSWORD",
      () => "The email or password you entered is incorrect."
    )
    .with("USER_NOT_FOUND", () => "No account found for that email.")
    .with(
      "EMAIL_NOT_VERIFIED",
      () => "Please verify your email before signing in."
    )
    .with("UNKNOWN", () => "Sign in failed. Please try again.")
    .exhaustive()

const SIGN_UP_ERROR_CODES = [
  "USER_ALREADY_EXISTS",
  "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL",
  "PASSWORD_TOO_SHORT",
  "INVALID_EMAIL",
] as const satisfies ReadonlyArray<string>

export type SignUpErrorCode = (typeof SIGN_UP_ERROR_CODES)[number] | "UNKNOWN"

export const toSignUpErrorCode = (code?: string): SignUpErrorCode =>
  SIGN_UP_ERROR_CODES.find((known) => known === code) ?? "UNKNOWN"

export const signUpErrorMessage = (code: SignUpErrorCode): string =>
  match(code)
    .with(
      "USER_ALREADY_EXISTS",
      "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL",
      () => "An account with that email already exists."
    )
    .with("PASSWORD_TOO_SHORT", () => "Password must be at least 8 characters.")
    .with("INVALID_EMAIL", () => "Enter a valid email address.")
    .with("UNKNOWN", () => "Sign up failed. Please try again.")
    .exhaustive()

const VERIFY_EMAIL_ERROR_CODES = [
  "INVALID_TOKEN",
  "TOKEN_EXPIRED",
  "USER_NOT_FOUND",
  "INVALID_USER",
] as const satisfies ReadonlyArray<string>

export type VerifyEmailErrorCode =
  | (typeof VERIFY_EMAIL_ERROR_CODES)[number]
  | "UNKNOWN"

export const toVerifyEmailErrorCode = (code?: string): VerifyEmailErrorCode =>
  VERIFY_EMAIL_ERROR_CODES.find((known) => known === code) ?? "UNKNOWN"

export const verifyEmailErrorMessage = (code: VerifyEmailErrorCode): string =>
  match(code)
    .with(
      "TOKEN_EXPIRED",
      () => "This verification link has expired. Request a new one below."
    )
    .with(
      "INVALID_TOKEN",
      () => "This verification link is invalid. Request a new one below."
    )
    .with("USER_NOT_FOUND", () => "We couldn't find an account for this link.")
    .with(
      "INVALID_USER",
      () => "This link belongs to a different account. Sign out and try again."
    )
    .with(
      "UNKNOWN",
      () => "We couldn't verify your email. Request a new link below."
    )
    .exhaustive()
