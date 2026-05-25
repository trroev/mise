"use client"

import type { Collection } from "@mise/payload/payload-types"
import { Checkbox } from "@mise/ui/components/Checkbox"
import { Popover } from "@mise/ui/components/Popover"
import { Spinner } from "@mise/ui/components/Spinner"
import { RiAddLine } from "@remixicon/react"
import { useState } from "react"
import { match } from "ts-pattern"
import { CreateCollectionDialog } from "~/features/collections/components/CreateCollectionDialog"
import { useAddRecipeToCollection } from "~/features/collections/hooks/use-add-recipe-to-collection"
import { useCollections } from "~/features/collections/hooks/use-collections"
import { useRemoveRecipeFromCollection } from "~/features/collections/hooks/use-remove-recipe-from-collection"

type AddToCollectionPopoverProps = {
  recipeId: string
  trigger: React.ReactNode
}

const toRecipeId = (value: unknown): string =>
  typeof value === "string"
    ? value
    : String((value as { id: string | number }).id)

const isMember = (collection: Collection, recipeId: string): boolean =>
  (collection.recipes ?? []).some((r) => toRecipeId(r) === recipeId)

export const AddToCollectionPopover = ({
  recipeId,
  trigger,
}: AddToCollectionPopoverProps) => {
  const [createOpen, setCreateOpen] = useState(false)
  const { data: collections, isLoading } = useCollections()
  const { mutate: addRecipe } = useAddRecipeToCollection()
  const { mutate: removeRecipe } = useRemoveRecipeFromCollection()

  const handleToggle = (collection: Collection, nextChecked: boolean): void => {
    match(nextChecked)
      .with(true, () => addRecipe({ collectionId: collection.id, recipeId }))
      .with(false, () =>
        removeRecipe({ collectionId: collection.id, recipeId })
      )
      .exhaustive()
  }

  const handleCreated = (collectionId: string): void => {
    addRecipe({ collectionId, recipeId })
  }

  return (
    <Popover.Root>
      <Popover.Trigger render={trigger as React.ReactElement} />
      <Popover.Popup className="w-72">
        <Popover.Title className="font-display text-heading-sm text-text-primary">
          Add to collection
        </Popover.Title>
        <Popover.Description className="sr-only">
          Choose which collections this recipe belongs to.
        </Popover.Description>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Spinner />
          </div>
        ) : (
          <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto">
            {collections && collections.length > 0 ? (
              collections.map((collection) => {
                const checked = isMember(collection, recipeId)
                const id = `collection-${collection.id}`
                return (
                  <li key={collection.id}>
                    <label
                      className="flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-surface-hover"
                      htmlFor={id}
                    >
                      <Checkbox
                        checked={checked}
                        id={id}
                        onCheckedChange={(next) =>
                          handleToggle(collection, next === true)
                        }
                      />
                      <span className="font-sans text-body text-text-primary">
                        {collection.name}
                      </span>
                    </label>
                  </li>
                )
              })
            ) : (
              <li className="px-2 py-2 font-sans text-body-sm text-text-secondary">
                No collections yet.
              </li>
            )}
          </ul>
        )}
        <button
          className="mt-3 flex w-full items-center gap-2 rounded-md border border-border px-3 py-2 font-sans text-body-sm text-text-primary hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          onClick={() => setCreateOpen(true)}
          type="button"
        >
          <RiAddLine aria-hidden="true" size={16} />
          Create new collection
        </button>
      </Popover.Popup>
      <CreateCollectionDialog
        onCreated={handleCreated}
        onOpenChange={setCreateOpen}
        open={createOpen}
      />
    </Popover.Root>
  )
}
