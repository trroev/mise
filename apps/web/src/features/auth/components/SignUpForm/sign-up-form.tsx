"use client"

import { authClient } from "@mise/auth/client"
import { Button } from "@mise/ui/components/Button"
import { Field } from "@mise/ui/components/Field"
import { Input } from "@mise/ui/components/Input"
import { useForm } from "@tanstack/react-form"
import { useState } from "react"
import { z } from "zod"
import { ResendVerificationButton } from "~/features/auth/components/ResendVerificationButton"
import {
  signUpErrorMessage,
  toSignUpErrorCode,
} from "~/features/auth/utils/auth-error-messages"

const signUpSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required."),
    email: z.email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password is too long."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

export const SignUpForm = () => {
  const [serverError, setServerError] = useState<string | undefined>()
  const [submittedEmail, setSubmittedEmail] = useState<string | undefined>()

  const form = useForm({
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    validators: { onChange: signUpSchema },
    onSubmit: async ({ value }) => {
      setServerError(undefined)
      const { error } = await authClient.signUp.email({
        name: value.name,
        email: value.email,
        password: value.password,
        callbackURL: "/verify-email",
      })
      if (error) {
        setServerError(signUpErrorMessage(toSignUpErrorCode(error.code)))
        return
      }
      setSubmittedEmail(value.email)
    },
  })

  if (submittedEmail) {
    return (
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <h2 className="font-display text-heading-md text-text-primary">
            Check your email
          </h2>
          <p className="text-body text-text-secondary">
            We sent a verification link to{" "}
            <span className="font-medium text-text-primary">
              {submittedEmail}
            </span>
            . Follow the link to activate your account.
          </p>
        </div>
        <ResendVerificationButton email={submittedEmail} />
      </div>
    )
  }

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <form.Field name="name">
        {(field) => (
          <Field
            error={
              field.state.meta.isTouched
                ? field.state.meta.errors[0]?.message
                : undefined
            }
            label="Name"
          >
            <Input
              autoComplete="name"
              id="name"
              name={field.name}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              required
              type="text"
              value={field.state.value}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="email">
        {(field) => (
          <Field
            error={
              field.state.meta.isTouched
                ? field.state.meta.errors[0]?.message
                : undefined
            }
            label="Email"
          >
            <Input
              autoComplete="email"
              id="email"
              name={field.name}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              required
              type="email"
              value={field.state.value}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="password">
        {(field) => (
          <Field
            error={
              field.state.meta.isTouched
                ? field.state.meta.errors[0]?.message
                : undefined
            }
            hint="At least 8 characters."
            label="Password"
          >
            <Input
              autoComplete="new-password"
              id="password"
              name={field.name}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              required
              type="password"
              value={field.state.value}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="confirmPassword">
        {(field) => (
          <Field
            error={
              field.state.meta.isTouched
                ? field.state.meta.errors[0]?.message
                : undefined
            }
            label="Confirm password"
          >
            <Input
              autoComplete="new-password"
              id="confirmPassword"
              name={field.name}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              required
              type="password"
              value={field.state.value}
            />
          </Field>
        )}
      </form.Field>
      {serverError && (
        <p
          aria-live="polite"
          className="font-sans text-body-sm text-destructive"
          role="alert"
        >
          {serverError}
        </p>
      )}
      <form.Subscribe
        selector={(state) => ({
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
        })}
      >
        {({ canSubmit, isSubmitting }) => (
          <Button disabled={!canSubmit || isSubmitting} type="submit">
            {isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
