import { Badge } from "@mise/ui/components/Badge"
import type { Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { match } from "ts-pattern"
import { auth } from "~/features/auth/auth.server"
import { SignOutButton } from "~/features/auth/components/SignOutButton"
import { CollectionsTab } from "~/features/collections/components/CollectionsTab"
import { AvatarManager } from "~/features/profile/components/AvatarManager"
import {
  ProfileTabs,
  type ProfileTabValue,
} from "~/features/profile/components/ProfileTabs"
import { getRecipesByAuthorUser } from "~/features/recipes/api/recipes-by-author"
import { SavedRecipesTab } from "~/features/saved-recipes/components/SavedRecipesTab"
import { getPayloadUserByBetterAuthId } from "~/lib/queries/payload-user-by-better-auth-id"

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
})

type ProfilePageProps = {
  searchParams: Promise<{ tab?: string }>
}

const resolveInitialTab = (raw: string | undefined): ProfileTabValue =>
  match(raw)
    .with("saved", () => "saved" as const)
    .with("collections", () => "collections" as const)
    .otherwise(() => "my-recipes" as const)

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const [session, { tab }] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    searchParams,
  ])
  if (!session) {
    redirect("/sign-in?callbackUrl=/profile")
  }

  const { user } = session
  const payloadUser = await getPayloadUserByBetterAuthId(user.id)
  const recipes = payloadUser
    ? await getRecipesByAuthorUser(payloadUser.id)
    : []

  const initialTab = resolveInitialTab(tab)

  const myRecipesPanel: ReactNode =
    recipes.length === 0 ? (
      <p className="text-body text-text-secondary">
        You haven&apos;t submitted any recipes yet.{" "}
        <Link className="underline" href="/submit">
          Submit one now
        </Link>
        .
      </p>
    ) : (
      <ul className="divide-y divide-border/40">
        {recipes.map((recipe) => {
          const isDraft = recipe._status !== "published"
          const href = isDraft
            ? `/recipes/${recipe.slug}?preview=draft`
            : `/recipes/${recipe.slug}`
          return (
            <li
              className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
              key={recipe.id}
            >
              <div className="space-y-1">
                <Link
                  className="font-display text-heading-md text-text-primary hover:underline"
                  href={href}
                >
                  {recipe.title}
                </Link>
                <p className="text-body-sm text-text-secondary">
                  Submitted {dateFormatter.format(new Date(recipe.createdAt))}
                </p>
              </div>
              {match(recipe._status)
                .with("published", () => <Badge>Published</Badge>)
                .otherwise(() => (
                  <Badge variant="muted">Draft</Badge>
                ))}
            </li>
          )
        })}
      </ul>
    )

  const savedPanel: ReactNode = payloadUser ? (
    <SavedRecipesTab payloadUserId={payloadUser.id} />
  ) : (
    <p className="text-body text-text-secondary">
      You haven&apos;t saved any recipes yet.
    </p>
  )

  const collectionsPanel: ReactNode = payloadUser ? (
    <CollectionsTab payloadUserId={payloadUser.id} />
  ) : (
    <p className="text-body text-text-secondary">
      Sign in to create collections.
    </p>
  )

  return (
    <section className="constrainer flex flex-col space-y-10 py-10">
      <div className="space-y-1">
        <h1 className="font-display text-heading-xl text-text-primary">
          Profile
        </h1>
        <p className="text-body text-text-secondary">
          Your account information.
        </p>
      </div>

      <div className="space-y-6">
        <AvatarManager
          avatarUrl={
            typeof payloadUser?.avatar === "object" && payloadUser.avatar
              ? (payloadUser.avatar.url ?? null)
              : null
          }
          email={user.email}
        />
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <dt className="text-body-sm text-text-secondary">Email</dt>
            <dd className="text-body text-text-primary">{user.email}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-body-sm text-text-secondary">Member since</dt>
            <dd className="text-body text-text-primary">
              {dateFormatter.format(new Date(user.createdAt))}
            </dd>
          </div>
        </dl>
        <SignOutButton />
      </div>

      <ProfileTabs
        collections={collectionsPanel}
        initialTab={initialTab}
        myRecipes={myRecipesPanel}
        saved={savedPanel}
      />
    </section>
  )
}
