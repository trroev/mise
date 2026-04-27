import config from "@payload-config"
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts"
import type { ServerFunctionClient } from "payload"
import type React from "react"
import { importMap } from "./importMap"

const serverFunction: ServerFunctionClient = async (args) => {
  "use server"
  return handleServerFunctions({ ...args, config, importMap })
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout
      config={config}
      importMap={importMap}
      serverFunction={serverFunction}
    >
      {children}
    </RootLayout>
  )
}
