"use client"

import { cn } from "@mise/ui/utils/cn"
import QRCode from "qrcode"
import { useEffect, useState } from "react"

export type QrCodeProps = {
  value: string
  size?: number
  className?: string
  alt?: string
}

export const QrCode = ({ value, size = 192, className, alt }: QrCodeProps) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDataUrl(null)
        }
      })
    return () => {
      cancelled = true
    }
  }, [value, size])

  if (!dataUrl) {
    return (
      <div
        aria-busy="true"
        className={cn("animate-pulse rounded bg-surface", className)}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    /** biome-ignore lint/performance/noImgElement: client-side data URL, not a remote asset */
    <img
      alt={alt ?? "QR code"}
      className={cn("rounded bg-white p-2", className)}
      height={size}
      src={dataUrl}
      width={size}
    />
  )
}
