import { createLogger } from "@mise/logger"
import { MongoClient } from "mongodb"

// One-off backfill for enabling requireEmailVerification: marks every user
// created before email verification shipped as verified so existing accounts
// are not locked out. Run once against the target database:
//   MONGODB_URI=... pnpm --filter @mise/auth backfill:email-verified

const log = createLogger({ name: "auth.backfill-email-verified" })

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error("MONGODB_URI is required")
}

const client = new MongoClient(uri)
const result = await client
  .db()
  .collection("user")
  .updateMany(
    { emailVerified: { $ne: true } },
    { $set: { emailVerified: true, updatedAt: new Date() } }
  )
log
  .withMetadata({
    matched: result.matchedCount,
    modified: result.modifiedCount,
  })
  .info("backfilled emailVerified for existing users")
await client.close()
