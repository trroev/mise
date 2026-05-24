"use client"

import { useSession } from "@mise/auth/session"
import { cn } from "@mise/ui/utils/cn"
import { RiHeart3Fill, RiHeart3Line } from "@remixicon/react"
import { match } from "ts-pattern"
import { useRequireSignIn } from "~/components/SignInModalProvider"
import { useSaveRecipe } from "~/features/saved-recipes/hooks/use-save-recipe"
import { type SaveButtonVariants, saveButton } from "./save-button.variants"

type ViewerState =
  | { kind: "authenticated" }
  | { kind: "anonymous" }
  | { kind: "loading" }

type SaveButtonProps = Omit<React.ComponentProps<"button">, "onClick"> & {
  recipeId: string
  variant?: SaveButtonVariants["variant"]
}

const resolveViewer = (
  isLoading: boolean,
  isAuthenticated: boolean
): ViewerState => {
  if (isLoading) {
    return { kind: "loading" }
  }
  if (isAuthenticated) {
    return { kind: "authenticated" }
  }
  return { kind: "anonymous" }
}

export const SaveButton = ({
  recipeId,
  className,
  variant,
  ...buttonProps
}: SaveButtonProps) => {
  const session = useSession()
  const { toggle, isSaved } = useSaveRecipe({ recipeId })
  const requireSignIn = useRequireSignIn()

  const viewer = resolveViewer(session.isLoading, session.isAuthenticated)

  const handleClick = (): void => {
    match(viewer)
      .with({ kind: "authenticated" }, () => {
        toggle()
      })
      .with({ kind: "anonymous" }, () => {
        requireSignIn(() => toggle())
      })
      .with({ kind: "loading" }, () => {
        // Wait for session to resolve before acting.
      })
      .exhaustive()
  }

  const label = isSaved ? "Saved" : "Save recipe"
  const Icon = isSaved ? RiHeart3Fill : RiHeart3Line

  return (
    <button
      aria-label={label}
      aria-pressed={isSaved}
      className={cn(saveButton({ variant, isSaved }), className)}
      disabled={viewer.kind === "loading"}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        handleClick()
      }}
      type="button"
      {...buttonProps}
    >
      <Icon aria-hidden="true" size={20} />
    </button>
  )
}

export const CardSaveButton = (props: Omit<SaveButtonProps, "variant">) => (
  <SaveButton {...props} variant="glass" />
)
