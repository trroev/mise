import { env } from "@mise/env/auth"
import { type BetterAuthOptions, betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { MongoClient } from "mongodb"
import { createVerificationEmailSender } from "./verificationEmail"

const client = new MongoClient(env.MONGODB_URI)

const sendVerificationEmail = createVerificationEmailSender({
  apiKey: env.RESEND_API_KEY,
  from: env.EMAIL_FROM,
})

export function createAuth(
  extraOptions?: Readonly<Partial<BetterAuthOptions>>
) {
  return betterAuth({
    database: mongodbAdapter(client.db(), { transaction: false }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    emailAndPassword: { enabled: true, requireEmailVerification: true },
    emailVerification: {
      autoSignInAfterVerification: true,
      sendOnSignUp: true,
      sendVerificationEmail: async ({ user, url }) => {
        await sendVerificationEmail({ user, url })
      },
    },
    ...extraOptions,
  })
}

export const auth = createAuth()

export type Session = typeof auth.$Infer.Session.session
export type User = typeof auth.$Infer.Session.user
