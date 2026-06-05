"use client"

import { Dialog } from "@mise/ui/components/Dialog"
import Link from "next/link"
import { SignInForm } from "~/features/auth/components/SignInForm"

type SignInModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export const SignInModal = ({
  open,
  onOpenChange,
  onSuccess,
}: SignInModalProps) => {
  const handleSuccess = (): void => {
    onSuccess?.()
    onOpenChange(false)
  }

  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.Title>Sign in to save recipes</Dialog.Title>
          <Dialog.Description>
            Sign in to keep your favorite recipes one tap away.
          </Dialog.Description>
          <div className="mt-6">
            <SignInForm onSuccessAction={handleSuccess} />
          </div>
          <p className="mt-4 font-sans text-body-sm text-text-secondary">
            Don&apos;t have an account?{" "}
            <Link
              className="underline underline-offset-4 hover:text-text-primary"
              href="/sign-up"
            >
              Create one
            </Link>
            .
          </p>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
