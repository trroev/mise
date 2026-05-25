import type { Recipe } from "@mise/payload/payload-types"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { auth } from "~/features/auth/auth.server"
import { getCollectionBySlug } from "~/features/collections/api/get-collection-by-slug"
import { AddToCollectionButton } from "~/features/collections/components/AddToCollectionButton"
import { CollectionDetail } from "~/features/collections/components/CollectionDetail"
import { CardSaveButton } from "~/features/saved-recipes/components/SaveButton"
import { canManageCollection } from "~/lib/policies/can-manage-collection"
import { getCurrentViewer } from "~/lib/queries/current-viewer"
import { getPayloadUserByBetterAuthId } from "~/lib/queries/payload-user-by-better-auth-id"

export const metadata: Metadata = {
  title: "Collection",
  robots: { index: false, follow: false },
}

type CollectionDetailPageProps = {
  params: Promise<{ slug: string }>
}

const isPopulatedRecipe = (value: unknown): value is Recipe =>
  typeof value === "object" && value !== null && "id" in value

export default async function CollectionDetailPage({
  params,
}: CollectionDetailPageProps): Promise<React.ReactElement> {
  const { slug } = await params

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    redirect(`/sign-in?callbackUrl=/profile/collections/${slug}`)
  }

  const payloadUser = await getPayloadUserByBetterAuthId(session.user.id)
  if (!payloadUser) {
    notFound()
  }

  const collection = await getCollectionBySlug({
    ownerId: payloadUser.id,
    slug,
  })
  if (!collection) {
    notFound()
  }

  const viewer = await getCurrentViewer()
  if (!canManageCollection(viewer, collection)) {
    notFound()
  }

  const recipes = (collection.recipes ?? []).filter(isPopulatedRecipe)

  const renderRecipeActions = (recipeId: string): React.ReactNode => (
    <div className="flex items-center gap-1">
      <CardSaveButton recipeId={recipeId} />
      <AddToCollectionButton recipeId={recipeId} />
    </div>
  )

  return (
    <CollectionDetail
      collection={collection}
      recipes={recipes}
      renderRecipeActions={renderRecipeActions}
    />
  )
}
