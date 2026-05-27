import { MongoMemoryServer } from "mongodb-memory-server"

// Pre-downloads the mongod binary in the main process, before workers start
// MSW with `onUnhandledRequest: "error"` and would block the HTTPS download.
export async function setup(): Promise<void> {
  const mongo = await MongoMemoryServer.create()
  await mongo.stop()
}
