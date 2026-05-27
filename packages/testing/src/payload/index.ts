import { MongoMemoryServer } from "mongodb-memory-server"
import type { Payload } from "payload"

export type PayloadTestHarness = {
  readonly payload: Payload
  readonly mongoUri: string
  readonly teardown: () => Promise<void>
}

export type StartPayloadTestOptions = {
  // Invoked after the in-memory Mongo URI and test env are written to
  // process.env, so the caller must dynamically import its payload.config here
  // — a static import would bake in the wrong MONGODB_URI at evaluation time.
  readonly loadPayload: () => Promise<Payload>
}

const applyTestEnv = (mongoUri: string): void => {
  process.env.SKIP_ENV_VALIDATION = "true"
  process.env.MONGODB_URI = mongoUri
  process.env.PAYLOAD_SECRET ??= "test-payload-secret"
}

export const startPayloadTest = async ({
  loadPayload,
}: StartPayloadTestOptions): Promise<PayloadTestHarness> => {
  const mongo = await MongoMemoryServer.create()
  const mongoUri = mongo.getUri()
  applyTestEnv(mongoUri)

  const payload = await loadPayload()

  const teardown = async (): Promise<void> => {
    await payload.destroy()
    await mongo.stop()
  }

  return { payload, mongoUri, teardown }
}
