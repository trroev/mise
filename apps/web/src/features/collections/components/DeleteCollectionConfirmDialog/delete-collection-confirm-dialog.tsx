"use client"

import { Button } from "@mise/ui/components/Button"
import { Dialog } from "@mise/ui/components/Dialog"
import { useDeleteCollection } from "~/features/collections/hooks/use-delete-collection"

type DeleteCollectionConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectionId: string
  collectionName: string
}

export const DeleteCollectionConfirmDialog = ({
  open,
  onOpenChange,
  collectionId,
  collectionName,
}: DeleteCollectionConfirmDialogProps) => {
  const { mutate, isPending } = useDeleteCollection()

  const handleConfirm = async (): Promise<void> => {
    const ok = await mutate({ collectionId })
    if (ok) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.Title>Delete collection</Dialog.Title>
          <Dialog.Description>
            Are you sure you want to delete &ldquo;{collectionName}&rdquo;? This
            removes the collection but does not unsave any recipes.
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close render={<Button variant="ghost">Cancel</Button>} />
            <Button
              disabled={isPending}
              onClick={handleConfirm}
              variant="destructive"
            >
              {isPending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
