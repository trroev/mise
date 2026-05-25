"use client"

import { Button } from "@mise/ui/components/Button"
import { Dialog } from "@mise/ui/components/Dialog"
import { Field } from "@mise/ui/components/Field"
import { Input } from "@mise/ui/components/Input"
import { useForm } from "@tanstack/react-form"
import { useEffect } from "react"
import { z } from "zod"
import { useRenameCollection } from "~/features/collections/hooks/use-rename-collection"

const schema = z.object({
  name: z.string().trim().min(1, "Name is required."),
})

type RenameCollectionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectionId: string
  initialName: string
}

export const RenameCollectionDialog = ({
  open,
  onOpenChange,
  collectionId,
  initialName,
}: RenameCollectionDialogProps) => {
  const { mutate, isPending, fieldError, reset } = useRenameCollection()

  const form = useForm({
    defaultValues: { name: initialName },
    validators: { onChange: schema },
    onSubmit: async ({ value }) => {
      const ok = await mutate({ collectionId, name: value.name })
      if (ok) {
        onOpenChange(false)
      }
    },
  })

  useEffect(() => {
    if (!open) {
      form.reset()
      reset()
    }
  }, [open, form, reset])

  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.Title>Rename collection</Dialog.Title>
          <Dialog.Description>
            Choose a new name for this collection.
          </Dialog.Description>
          <form
            className="mt-6 flex flex-col gap-4"
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <form.Field name="name">
              {(field) => {
                const clientError = field.state.meta.isTouched
                  ? field.state.meta.errors[0]?.message
                  : undefined
                const serverError =
                  fieldError?.field === "name" ? fieldError.message : undefined
                return (
                  <Field error={clientError ?? serverError} label="Name">
                    <Input
                      autoComplete="off"
                      autoFocus
                      id="rename-collection-name"
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      required
                      type="text"
                      value={field.state.value}
                    />
                  </Field>
                )
              }}
            </form.Field>
            <div className="flex justify-end gap-2">
              <Dialog.Close render={<Button variant="ghost">Cancel</Button>} />
              <form.Subscribe
                selector={(state) => ({
                  canSubmit: state.canSubmit,
                  isSubmitting: state.isSubmitting,
                })}
              >
                {({ canSubmit, isSubmitting }) => (
                  <Button
                    disabled={!canSubmit || isSubmitting || isPending}
                    type="submit"
                  >
                    {isPending || isSubmitting ? "Saving…" : "Save"}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
