"use client"

import { Button } from "@mise/ui/components/Button"
import { Dialog } from "@mise/ui/components/Dialog"
import { RiUploadLine } from "@remixicon/react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useId, useRef, useState, useTransition } from "react"
import { match } from "ts-pattern"
import { removeAvatar, uploadAvatar } from "~/lib/actions/avatar"

const MAX_AVATAR_BYTES = 5 * 1024 * 1024

const ALLOWED_AVATAR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const satisfies ReadonlyArray<string>

type AllowedAvatarMimeType = (typeof ALLOWED_AVATAR_MIME_TYPES)[number]

const isAllowedMimeType = (value: string): value is AllowedAvatarMimeType =>
  (ALLOWED_AVATAR_MIME_TYPES as ReadonlyArray<string>).includes(value)

type AvatarManagerProps = {
  avatarUrl: string | null
  email: string
}

type Selection = Readonly<{ file: File; previewUrl: string }>

type DialogStatus =
  | { kind: "idle" }
  | { kind: "uploading" }
  | { kind: "error"; message: string }

const buildDisplayUrl = (url: string): string =>
  url.replace("/upload/", "/upload/c_thumb,g_face,w_192,h_192/")

const buildInitial = (email: string): string =>
  email.charAt(0).toUpperCase() || "?"

export const AvatarManager = ({ avatarUrl, email }: AvatarManagerProps) => {
  const router = useRouter()
  const fileInputId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [selection, setSelection] = useState<Selection | undefined>()
  const [status, setStatus] = useState<DialogStatus>({ kind: "idle" })
  const [isRemoving, startRemove] = useTransition()

  useEffect(
    () => () => {
      if (selection) {
        URL.revokeObjectURL(selection.previewUrl)
      }
    },
    [selection]
  )

  const resetDialog = () => {
    if (selection) {
      URL.revokeObjectURL(selection.previewUrl)
    }
    setSelection(undefined)
    setStatus({ kind: "idle" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      resetDialog()
    }
  }

  const handleFileChange = (file: File | undefined) => {
    if (!file) {
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setStatus({ kind: "error", message: "Image must be under 5 MB." })
      return
    }
    if (!isAllowedMimeType(file.type)) {
      setStatus({
        kind: "error",
        message: "Image must be JPEG, PNG, or WebP.",
      })
      return
    }
    if (selection) {
      URL.revokeObjectURL(selection.previewUrl)
    }
    setSelection({ file, previewUrl: URL.createObjectURL(file) })
    setStatus({ kind: "idle" })
  }

  const handleConfirm = async () => {
    if (!selection) {
      return
    }
    setStatus({ kind: "uploading" })
    const formData = new FormData()
    formData.set("avatar", selection.file)
    const result = await uploadAvatar(formData)
    if (result.status === "error") {
      setStatus({ kind: "error", message: result.message })
      return
    }
    resetDialog()
    setIsOpen(false)
    router.refresh()
  }

  const handleRemove = () => {
    startRemove(async () => {
      const result = await removeAvatar()
      if (result.status === "success") {
        router.refresh()
      }
    })
  }

  const displayUrl = avatarUrl ? buildDisplayUrl(avatarUrl) : null

  return (
    <div className="flex items-center gap-4">
      <div className="relative size-24 shrink-0 overflow-hidden rounded-full border border-border bg-surface">
        {displayUrl ? (
          <Image
            alt="Profile photo"
            className="object-cover"
            fill
            sizes="96px"
            src={displayUrl}
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center font-display text-heading-md text-text-secondary"
          >
            {buildInitial(email)}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Dialog.Root onOpenChange={handleOpenChange} open={isOpen}>
          <Dialog.Trigger
            render={<Button variant="secondary">Change photo</Button>}
          />
          <Dialog.Portal>
            <Dialog.Backdrop />
            <Dialog.Popup>
              <Dialog.Title>Update profile photo</Dialog.Title>
              <Dialog.Description>
                JPEG, PNG, or WebP up to 5 MB.
              </Dialog.Description>

              <div className="mt-6 flex flex-col gap-4">
                <label
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-border border-dashed bg-surface p-6 text-body-sm text-text-secondary transition-colors hover:bg-secondary/75"
                  htmlFor={fileInputId}
                >
                  <RiUploadLine aria-hidden="true" size={20} />
                  <span>Click to choose an image</span>
                </label>
                <input
                  accept={ALLOWED_AVATAR_MIME_TYPES.join(",")}
                  className="sr-only"
                  id={fileInputId}
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                  ref={fileInputRef}
                  type="file"
                />

                {selection && (
                  <div className="flex items-center gap-4">
                    <div className="relative size-24 shrink-0 overflow-hidden rounded-full border border-border">
                      {/* biome-ignore lint/performance/noImgElement: blob preview URL, next/image not applicable */}
                      <img
                        alt="Selected avatar preview"
                        className="h-full w-full object-cover"
                        height={96}
                        src={selection.previewUrl}
                        width={96}
                      />
                    </div>
                    <p className="text-body-sm text-text-secondary">
                      {selection.file.name}
                    </p>
                  </div>
                )}

                {status.kind === "error" && (
                  <p
                    aria-live="polite"
                    className="text-body-sm text-destructive"
                    role="alert"
                  >
                    {status.message}
                  </p>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Dialog.Close
                  render={<Button variant="ghost">Cancel</Button>}
                />
                <Button
                  disabled={!selection || status.kind === "uploading"}
                  onClick={handleConfirm}
                >
                  {match(status)
                    .with({ kind: "uploading" }, () => "Uploading…")
                    .otherwise(() => "Upload photo")}
                </Button>
              </div>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>

        {avatarUrl && (
          <Button
            disabled={isRemoving}
            onClick={handleRemove}
            size="sm"
            variant="ghost"
          >
            {isRemoving ? "Removing…" : "Remove photo"}
          </Button>
        )}
      </div>
    </div>
  )
}
