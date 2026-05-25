"use client"

import type { Collection } from "@mise/payload/payload-types"
import { Button } from "@mise/ui/components/Button"
import { RiAddLine, RiDeleteBin6Line, RiPencilLine } from "@remixicon/react"
import Link from "next/link"
import { useState } from "react"
import { match } from "ts-pattern"
import { CreateCollectionDialog } from "~/features/collections/components/CreateCollectionDialog"
import { DeleteCollectionConfirmDialog } from "~/features/collections/components/DeleteCollectionConfirmDialog"
import { RenameCollectionDialog } from "~/features/collections/components/RenameCollectionDialog"
import { useCollections } from "~/features/collections/hooks/use-collections"

type DialogState =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "rename"; collectionId: string; name: string }
  | { kind: "delete"; collectionId: string; name: string }

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
})

const recipeCount = (collection: Collection): number =>
  (collection.recipes ?? []).length

export const CollectionsList = () => {
  const { data: collections } = useCollections()
  const [dialog, setDialog] = useState<DialogState>({ kind: "closed" })

  const handleOpenChange = (open: boolean): void => {
    if (!open) {
      setDialog({ kind: "closed" })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-sans text-body-sm text-text-secondary">
          Group your saved recipes into private collections.
        </p>
        <Button
          onClick={() => setDialog({ kind: "create" })}
          type="button"
          variant="primary"
        >
          <RiAddLine aria-hidden="true" size={16} />
          New collection
        </Button>
      </div>

      {collections && collections.length > 0 ? (
        <ul className="divide-y divide-border/40">
          {collections.map((collection) => (
            <li
              className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
              key={collection.id}
            >
              <div className="space-y-1">
                <Link
                  className="font-display text-heading-md text-text-primary hover:underline"
                  href={`/profile/collections/${collection.slug ?? collection.id}`}
                >
                  {collection.name}
                </Link>
                <p className="font-sans text-body-sm text-text-secondary">
                  {recipeCount(collection)} recipe
                  {recipeCount(collection) === 1 ? "" : "s"} · Updated{" "}
                  {dateFormatter.format(new Date(collection.updatedAt))}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  aria-label={`Rename ${collection.name}`}
                  onClick={() =>
                    setDialog({
                      kind: "rename",
                      collectionId: collection.id,
                      name: collection.name,
                    })
                  }
                  type="button"
                  variant="ghost"
                >
                  <RiPencilLine aria-hidden="true" size={16} />
                  Rename
                </Button>
                <Button
                  aria-label={`Delete ${collection.name}`}
                  onClick={() =>
                    setDialog({
                      kind: "delete",
                      collectionId: collection.id,
                      name: collection.name,
                    })
                  }
                  type="button"
                  variant="ghost"
                >
                  <RiDeleteBin6Line aria-hidden="true" size={16} />
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-body text-text-secondary">
          You haven&apos;t created any collections yet. Create one to start
          grouping recipes.
        </p>
      )}

      {match(dialog)
        .with({ kind: "create" }, () => (
          <CreateCollectionDialog onOpenChange={handleOpenChange} open />
        ))
        .with({ kind: "rename" }, ({ collectionId, name }) => (
          <RenameCollectionDialog
            collectionId={collectionId}
            initialName={name}
            onOpenChange={handleOpenChange}
            open
          />
        ))
        .with({ kind: "delete" }, ({ collectionId, name }) => (
          <DeleteCollectionConfirmDialog
            collectionId={collectionId}
            collectionName={name}
            onOpenChange={handleOpenChange}
            open
          />
        ))
        .with({ kind: "closed" }, () => null)
        .exhaustive()}
    </div>
  )
}
