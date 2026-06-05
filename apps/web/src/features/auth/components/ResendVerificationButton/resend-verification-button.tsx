"use client"

import { Button } from "@mise/ui/components/Button"
import { useEffect, useState } from "react"
import { match } from "ts-pattern"
import { resendVerificationEmailAction } from "~/features/auth/actions/resend-verification-email"

const COOLDOWN_SECONDS = 60

type ResendState =
  | { readonly status: "idle" }
  | { readonly status: "sending" }
  | { readonly status: "sent"; readonly secondsLeft: number }
  | { readonly status: "error"; readonly message: string }

type ResendVerificationButtonProps = {
  readonly email: string
}

export const ResendVerificationButton = ({
  email,
}: ResendVerificationButtonProps) => {
  const [state, setState] = useState<ResendState>({ status: "idle" })

  useEffect(() => {
    if (state.status !== "sent") {
      return
    }
    if (state.secondsLeft <= 0) {
      setState({ status: "idle" })
      return
    }
    const timeout = setTimeout(() => {
      setState({ status: "sent", secondsLeft: state.secondsLeft - 1 })
    }, 1000)
    return () => clearTimeout(timeout)
  }, [state])

  const handleResend = async (): Promise<void> => {
    setState({ status: "sending" })
    const result = await resendVerificationEmailAction(email)
    setState(
      match(result)
        .with(
          { status: "success" },
          (): ResendState => ({
            status: "sent",
            secondsLeft: COOLDOWN_SECONDS,
          })
        )
        .with(
          { status: "error" },
          ({ message }): ResendState => ({ status: "error", message })
        )
        .exhaustive()
    )
  }

  const isDisabled = state.status === "sending" || state.status === "sent"

  return (
    <div className="flex flex-col gap-1">
      <Button
        disabled={isDisabled}
        onClick={handleResend}
        size="sm"
        type="button"
        variant="outline"
      >
        {match(state)
          .with({ status: "idle" }, () => "Resend verification email")
          .with({ status: "sending" }, () => "Sending…")
          .with(
            { status: "sent" },
            ({ secondsLeft }) => `Email sent — resend in ${secondsLeft}s`
          )
          .with({ status: "error" }, () => "Resend verification email")
          .exhaustive()}
      </Button>
      {state.status === "error" && (
        <p
          aria-live="polite"
          className="font-sans text-body-sm text-destructive"
          role="alert"
        >
          {state.message}
        </p>
      )}
    </div>
  )
}
