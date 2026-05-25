"use client"

import { useSession } from "@mise/auth/session"
import { Button } from "@mise/ui/components/Button"
import { RiBookmarkLine } from "@remixicon/react"
import { match } from "ts-pattern"
import { useRequireSignIn } from "~/components/SignInModalProvider"
import { AddToCollectionPopover } from "~/features/collections/components/AddToCollectionPopover"

type AddToCollectionButtonProps = {
  recipeId: string
}

type ViewerState =
  | { kind: "authenticated" }
  | { kind: "anonymous" }
  | { kind: "loading" }

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

export const AddToCollectionButton = ({
  recipeId,
}: AddToCollectionButtonProps) => {
  const session = useSession()
  const requireSignIn = useRequireSignIn()
  const viewer = resolveViewer(session.isLoading, session.isAuthenticated)

  return match(viewer)
    .with({ kind: "authenticated" }, () => (
      <AddToCollectionPopover
        recipeId={recipeId}
        trigger={
          <Button aria-label="Add to collection" type="button" variant="ghost">
            <RiBookmarkLine aria-hidden="true" size={20} />
            Add to collection
          </Button>
        }
      />
    ))
    .with({ kind: "anonymous" }, () => (
      <Button
        aria-label="Add to collection"
        onClick={() => requireSignIn(() => undefined)}
        type="button"
        variant="ghost"
      >
        <RiBookmarkLine aria-hidden="true" size={20} />
        Add to collection
      </Button>
    ))
    .with({ kind: "loading" }, () => (
      <Button
        aria-label="Add to collection"
        disabled
        type="button"
        variant="ghost"
      >
        <RiBookmarkLine aria-hidden="true" size={20} />
        Add to collection
      </Button>
    ))
    .exhaustive()
}
