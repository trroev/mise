"use server"

import "server-only"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "~/lib/auth.server"

export const signOutAction = async (): Promise<void> => {
  await auth.api.signOut({ headers: await headers() })
  revalidatePath("/", "layout")
  redirect("/")
}
