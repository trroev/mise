"use client"

import { Button } from "@mise/ui/components/Button"
import { Field } from "@mise/ui/components/Field"
import { Input } from "@mise/ui/components/Input"
import Link from "next/link"
import { useState } from "react"
import { ResendVerificationButton } from "~/features/auth/components/ResendVerificationButton"
import {
  toVerifyEmailErrorCode,
  verifyEmailErrorMessage,
} from "~/features/auth/utils/auth-error-messages"

type VerifyEmailStatusProps = {
  readonly errorCode?: string
}

export const VerifyEmailStatus = ({ errorCode }: VerifyEmailStatusProps) => {
  const [email, setEmail] = useState("")

  if (errorCode === undefined) {
    return (
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-heading-xl text-text-primary">
            Email verified
          </h1>
          <p className="text-body text-text-secondary">
            Your account is active and you're signed in.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/" />}>
          Browse recipes
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="font-display text-heading-xl text-text-primary">
          Verification failed
        </h1>
        <p
          aria-live="polite"
          className="text-body text-text-secondary"
          role="alert"
        >
          {verifyEmailErrorMessage(toVerifyEmailErrorCode(errorCode))}
        </p>
      </div>
      <Field label="Email">
        <Input
          autoComplete="email"
          id="email"
          name="email"
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          value={email}
        />
      </Field>
      <ResendVerificationButton email={email} />
    </div>
  )
}
