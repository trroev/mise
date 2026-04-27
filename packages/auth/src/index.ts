import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { MongoClient } from "mongodb"

const client = new MongoClient(
  process.env.MONGODB_URI ?? "mongodb://localhost:27017/mise"
)

export const auth = betterAuth({
  database: mongodbAdapter(client.db(), { transaction: false }),
})

export type Session = typeof auth.$Infer.Session.session
export type User = typeof auth.$Infer.Session.user
