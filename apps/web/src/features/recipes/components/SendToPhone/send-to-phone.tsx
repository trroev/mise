"use client"

import { Button } from "@mise/ui/components/Button"
import { Popover } from "@mise/ui/components/Popover"
import { QrCode } from "@mise/ui/components/QrCode"
import { RiQrCodeLine } from "@remixicon/react"
import { useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { match } from "ts-pattern"
import { UNIT_SYSTEMS } from "~/features/recipes/hooks/use-checklist-state"
import {
  type BuildShareUrlUnits,
  buildShareUrl,
} from "~/features/recipes/utils/build-share-url"

export type SendToPhoneProps = {
  slug: string
  origin: string
}

const isUnitSystem = (value: string | null): value is BuildShareUrlUnits =>
  value !== null && (UNIT_SYSTEMS as ReadonlyArray<string>).includes(value)

export const SendToPhone = ({ slug, origin }: SendToPhoneProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const searchParams = useSearchParams()

  const yieldValue = useMemo(() => {
    const raw = searchParams.get("yield")
    return match(raw)
      .with(null, () => null)
      .otherwise((value) => {
        const parsed = Number.parseInt(value, 10)
        return Number.isFinite(parsed) && parsed >= 1 ? parsed : null
      })
  }, [searchParams])

  const units = useMemo<BuildShareUrlUnits | null>(() => {
    const raw = searchParams.get("units")
    return isUnitSystem(raw) ? raw : null
  }, [searchParams])

  const shareUrl = useMemo(
    () => buildShareUrl({ origin, slug, yield: yieldValue, units }),
    [origin, slug, yieldValue, units]
  )

  return (
    <Popover.Root onOpenChange={setIsOpen} open={isOpen}>
      <Popover.Trigger
        render={
          <Button aria-label="Send to phone" size="icon" variant="outline">
            <RiQrCodeLine />
          </Button>
        }
      />
      <Popover.Popup className="w-72 space-y-3" sideOffset={8}>
        <Popover.Title>Send to phone</Popover.Title>
        <Popover.Description>
          Scan to open this recipe on another device.
        </Popover.Description>
        <div className="flex justify-center">
          <QrCode alt={`QR code for ${slug}`} size={192} value={shareUrl} />
        </div>
        <p className="break-all rounded bg-surface-muted p-2 font-mono text-text-secondary text-xs">
          <span className="select-all">{shareUrl}</span>
        </p>
      </Popover.Popup>
    </Popover.Root>
  )
}
