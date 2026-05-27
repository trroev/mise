import { HttpResponse, http } from "msw"
import { setupServer } from "msw/node"

export const server = setupServer(
  http.post(
    "https://telemetry.payloadcms.com/events",
    () => new HttpResponse(null, { status: 204 })
  )
)

export * from "./handlers"
