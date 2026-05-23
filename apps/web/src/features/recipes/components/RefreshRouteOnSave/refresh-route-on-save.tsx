"use client"

import { RefreshRouteOnSave as PayloadRefreshRouteOnSave } from "@payloadcms/live-preview-react"
import { useRouter } from "next/navigation"

type RefreshRouteOnSaveProps = {
  readonly serverURL: string
}

export function RefreshRouteOnSave({ serverURL }: RefreshRouteOnSaveProps) {
  const router = useRouter()
  return (
    <PayloadRefreshRouteOnSave
      refresh={() => router.refresh()}
      serverURL={serverURL}
    />
  )
}
