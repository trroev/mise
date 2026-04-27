import { env } from "@mise/env/auth"
import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { MongoClient } from "mongodb"

const client = new MongoClient(env.MONGODB_URI)

export const auth = betterAuth({
  database: mongodbAdapter(client.db(), { transaction: false }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
})

export type Session = typeof auth.$Infer.Session.session
export type User = typeof auth.$Infer.Session.user
