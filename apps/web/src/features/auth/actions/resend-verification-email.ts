"use server"

import "server-only"

import type { ActionResult } from "@mise/types/ActionResult"
import { z } from "zod"
import { auth } from "~/features/auth/auth.server"
import { serverAction } from "~/lib/server-action"

const emailSchema = z.email()

const resendVerificationEmailImpl = async (
  email: string
): Promise<ActionResult<void>> => {
  const parsed = emailSchema.safeParse(email)
  if (!parsed.success) {
    return { status: "error", message: "Enter a valid email address." }
  }
  await auth.api.sendVerificationEmail({
    body: { email: parsed.data, callbackURL: "/verify-email" },
  })
  return { status: "success", data: undefined }
}

export const resendVerificationEmailAction = serverAction(
  resendVerificationEmailImpl
)
