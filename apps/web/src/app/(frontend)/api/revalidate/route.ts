import { env } from "@mise/env/app"
import { revalidatePath } from "next/cache"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

type RevalidateBody = {
  slug: string
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${env.REVALIDATION_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: RevalidateBody
  try {
    body = (await request.json()) as RevalidateBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  revalidatePath("/recipes")
  revalidatePath(`/recipes/${body.slug}`)

  return NextResponse.json({ revalidated: true, slug: body.slug })
}
