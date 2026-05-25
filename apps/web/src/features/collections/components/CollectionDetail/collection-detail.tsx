"use client"

import type { Collection, Recipe } from "@mise/payload/payload-types"
import { Button } from "@mise/ui/components/Button"
import { formatDate } from "@mise/utils/formatDate"
import { RiDeleteBin6Line, RiPencilLine } from "@remixicon/react"
import Link from "next/link"
import type { ReactNode } from "react"
import { useState } from "react"
import { match } from "ts-pattern"
import { DeleteCollectionConfirmDialog } from "~/features/collections/components/DeleteCollectionConfirmDialog"
import { RenameCollectionDialog } from "~/features/collections/components/RenameCollectionDialog"
import { RecipeCard } from "~/features/recipes/components/RecipeCard"

type CollectionRecipeEntry = {
  recipe: Recipe
  actions?: ReactNode
}

type CollectionDetailProps = {
  collection: Collection
  entries: ReadonlyArray<CollectionRecipeEntry>
}

type DialogState = { kind: "closed" } | { kind: "rename" } | { kind: "delete" }

export const CollectionDetail = ({
  collection,
  entries,
}: CollectionDetailProps) => {
  const [dialog, setDialog] = useState<DialogState>({ kind: "closed" })

  const handleOpenChange = (open: boolean): void => {
    if (!open) {
      setDialog({ kind: "closed" })
    }
  }

  return (
    <section className="constrainer flex flex-col space-y-10 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Link
            className="font-sans text-body-sm text-text-secondary hover:underline"
            href="/profile?tab=collections"
          >
            ← All collections
          </Link>
          <h1 className="font-display text-heading-xl text-text-primary">
            {collection.name}
          </h1>
          <p className="font-sans text-body-sm text-text-secondary">
            Updated {formatDate(collection.updatedAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            aria-label={`Rename ${collection.name}`}
            onClick={() => setDialog({ kind: "rename" })}
            type="button"
            variant="ghost"
          >
            <RiPencilLine aria-hidden="true" size={16} />
            Rename
          </Button>
          <Button
            aria-label={`Delete ${collection.name}`}
            onClick={() => setDialog({ kind: "delete" })}
            type="button"
            variant="ghost"
          >
            <RiDeleteBin6Line aria-hidden="true" size={16} />
            Delete
          </Button>
        </div>
      </div>

      {entries.length > 0 ? (
        <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {entries.map(({ recipe, actions }) => (
            <li key={recipe.id}>
              <RecipeCard actions={actions} recipe={recipe} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-body text-text-secondary">
          This collection is empty.{" "}
          <Link className="underline" href="/recipes">
            Browse recipes
          </Link>{" "}
          to add some.
        </p>
      )}

      {match(dialog)
        .with({ kind: "rename" }, () => (
          <RenameCollectionDialog
            collectionId={collection.id}
            initialName={collection.name}
            onOpenChange={handleOpenChange}
            open
          />
        ))
        .with({ kind: "delete" }, () => (
          <DeleteCollectionConfirmDialog
            collectionId={collection.id}
            collectionName={collection.name}
            onOpenChange={handleOpenChange}
            open
          />
        ))
        .with({ kind: "closed" }, () => null)
        .exhaustive()}
    </section>
  )
}
