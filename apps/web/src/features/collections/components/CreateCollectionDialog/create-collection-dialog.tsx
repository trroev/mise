"use client"

import { Button } from "@mise/ui/components/Button"
import { Dialog } from "@mise/ui/components/Dialog"
import { Field } from "@mise/ui/components/Field"
import { Input } from "@mise/ui/components/Input"
import { useForm } from "@tanstack/react-form"
import { useEffect } from "react"
import { z } from "zod"
import { useCreateCollection } from "~/features/collections/hooks/use-create-collection"

const schema = z.object({
  name: z.string().trim().min(1, "Name is required."),
})

type CreateCollectionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (collectionId: string) => void
}

export const CreateCollectionDialog = ({
  open,
  onOpenChange,
  onCreated,
}: CreateCollectionDialogProps) => {
  const { mutate, isPending, fieldError, reset } = useCreateCollection()

  const form = useForm({
    defaultValues: { name: "" },
    validators: { onChange: schema },
    onSubmit: async ({ value }) => {
      const collectionId = await mutate({ name: value.name })
      if (collectionId) {
        onCreated?.(collectionId)
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
          <Dialog.Title>New collection</Dialog.Title>
          <Dialog.Description>
            Group your saved recipes under a private collection.
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
                      id="collection-name"
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
                    {isPending || isSubmitting ? "Creating…" : "Create"}
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
