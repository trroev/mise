import { Badge } from "@mise/ui/components/Badge"
import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { match } from "ts-pattern"
import { AvatarManager } from "~/components/AvatarManager"
import { SignOutButton } from "~/components/SignOutButton"
import { getCurrentViewer } from "~/lib/queries/current-viewer"
import { getRecipesByAuthorUser } from "~/lib/queries/recipes-by-author"

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
})

export default async function ProfilePage() {
  const viewer = await getCurrentViewer()
  if (viewer?.kind !== "user") {
    redirect("/sign-in?callbackUrl=/profile")
  }

  const payloadUser = viewer.user
  const recipes = await getRecipesByAuthorUser(payloadUser.id)

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
          email={payloadUser.email}
        />
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <dt className="text-body-sm text-text-secondary">Email</dt>
            <dd className="text-body text-text-primary">{payloadUser.email}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-body-sm text-text-secondary">Member since</dt>
            <dd className="text-body text-text-primary">
              {dateFormatter.format(new Date(payloadUser.createdAt))}
            </dd>
          </div>
        </dl>
        <SignOutButton />
      </div>

      <section
        aria-labelledby="my-recipes-heading"
        className="space-y-4 border-border/40 border-t pt-8"
      >
        <h2
          className="font-display text-heading-lg text-text-primary"
          id="my-recipes-heading"
        >
          My recipes
        </h2>
        {recipes.length === 0 ? (
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
                      Submitted{" "}
                      {dateFormatter.format(new Date(recipe.createdAt))}
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
        )}
      </section>
    </section>
  )
}
