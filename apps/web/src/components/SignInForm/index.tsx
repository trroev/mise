"use client"

import { Button } from "@mise/ui/components/Button"
import { Field } from "@mise/ui/components/Field"
import { Input } from "@mise/ui/components/Input"
import { useForm } from "@tanstack/react-form"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { authClient } from "~/lib/auth-client"

const isSafeCallbackUrl = (value: string | null): value is string =>
  value?.startsWith("/") === true && !value.startsWith("//")

export const SignInForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawCallback = searchParams.get("callbackUrl")
  const callbackUrl = isSafeCallbackUrl(rawCallback) ? rawCallback : "/recipes"
  const [serverError, setServerError] = useState<string | undefined>()

  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      setServerError(undefined)
      const { error } = await authClient.signIn.email(value)
      if (error) {
        setServerError(error.message ?? "Sign in failed.")
        return
      }
      router.push(callbackUrl)
    },
  })

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <form.Field
        name="email"
        validators={{
          onChange: ({ value }) => (value ? undefined : "Email is required."),
        }}
      >
        {(field) => (
          <Field
            error={
              field.state.meta.isTouched
                ? field.state.meta.errors[0]
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
              type="email"
              value={field.state.value}
            />
          </Field>
        )}
      </form.Field>
      <form.Field
        name="password"
        validators={{
          onChange: ({ value }) =>
            value ? undefined : "Password is required.",
        }}
      >
        {(field) => (
          <Field
            error={
              field.state.meta.isTouched
                ? field.state.meta.errors[0]
                : undefined
            }
            label="Password"
          >
            <Input
              autoComplete="current-password"
              id="password"
              name={field.name}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              type="password"
              value={field.state.value}
            />
          </Field>
        )}
      </form.Field>
      {serverError && (
        <p className="font-sans text-body-sm text-destructive">{serverError}</p>
      )}
      <form.Subscribe
        selector={(state) => ({
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
        })}
      >
        {({ canSubmit, isSubmitting }) => (
          <Button disabled={!canSubmit || isSubmitting} type="submit">
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
