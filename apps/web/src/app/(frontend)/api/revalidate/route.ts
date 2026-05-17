import { env } from "@mise/env/app"
import { revalidatePath } from "next/cache"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { match, P } from "ts-pattern"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = request.headers.get("authorization")
  const body = await request.json().catch(() => null)

  return match({ auth, body })
    .when(
      ({ auth }) => auth !== `Bearer ${env.REVALIDATION_SECRET}`,
      () => NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    )
    .with({ body: { slug: P.string } }, ({ body: { slug } }) => {
      revalidatePath("/recipes")
      revalidatePath(`/recipes/${slug}`)
      return NextResponse.json({ revalidated: true, slug })
    })
    .otherwise(() =>
      NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    )
}
