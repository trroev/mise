import { buildRecipeJsonLd } from "@mise/features/utils/buildRecipeJsonLd"
import {
  COURSE_LABELS,
  DIETARY_TAG_LABELS,
  DIFFICULTY_LABELS,
} from "@mise/features/utils/recipeLabels"
import { transformCloudinary } from "@mise/features/utils/transformCloudinary"
import { Badge } from "@mise/ui/components/Badge"
import { formatDuration } from "@mise/utils/formatDuration"
import { RiTimerLine } from "@remixicon/react"
import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { JsonLd } from "react-schemaorg"
import type { Recipe as RecipeSchema } from "schema-dts"
import { match, P } from "ts-pattern"
import { RecipeControls } from "~/components/RecipeControls"
import { getPublishedRecipes } from "~/lib/queries/published-recipes"
import { getRecipeBySlug } from "~/lib/queries/recipe-by-slug"

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const recipes = await getPublishedRecipes()
  return recipes.map((recipe) => ({ slug: recipe.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const recipe = await getRecipeBySlug(slug)
  if (!recipe) {
    return {}
  }

  const rawImageUrl = match({
    metaImage: recipe.meta?.image,
    heroImage: recipe.heroImage,
  })
    .with({ metaImage: { url: P.string } }, ({ metaImage }) => metaImage.url)
    .with({ heroImage: { url: P.string } }, ({ heroImage }) => heroImage.url)
    .otherwise(() => undefined)

  const ogImage = rawImageUrl
    ? transformCloudinary(rawImageUrl, "c_fill,g_auto,w_1200,h_630")
    : undefined

  return {
    title: recipe.meta?.title ?? recipe.title,
    description: recipe.meta?.description ?? recipe.description ?? undefined,
    openGraph: ogImage
      ? {
          type: "article",
          images: [{ url: ogImage, width: 1200, height: 630 }],
        }
      : undefined,
    twitter: { card: "summary_large_image" },
  }
}

export default async function RecipeDetailPage({ params }: Props) {
  const { slug } = await params
  const recipe = await getRecipeBySlug(slug)
  if (!recipe) {
    notFound()
  }

  const { heroUrl, heroAlt } = match(recipe.heroImage)
    .with({ url: P.string }, (img) => ({ heroUrl: img.url, heroAlt: img.alt }))
    .otherwise(() => ({ heroUrl: null, heroAlt: recipe.title }))

  const cuisineName = match(recipe.cuisine)
    .with({ name: P.string }, (c) => c.name)
    .otherwise(() => null)

  const hasTime = match(recipe)
    .with(
      P.union(
        { prepTime: P.not(P.nullish) },
        { cookTime: P.not(P.nullish) },
        { totalTime: P.not(P.nullish) }
      ),
      () => true
    )
    .otherwise(() => false)

  return (
    <article>
      <JsonLd<RecipeSchema> item={buildRecipeJsonLd(recipe)} />
      {heroUrl && (
        <div className="relative aspect-video w-full overflow-hidden bg-surface">
          <Image
            alt={heroAlt}
            className="object-cover"
            fill
            priority
            sizes="100vw"
            src={heroUrl}
          />
        </div>
      )}

      <div className="constrainer space-y-10 py-10">
        <header className="space-y-4">
          <h1 className="font-display text-heading-xl text-text-primary">
            {recipe.title}
          </h1>
          {recipe.description && (
            <p className="max-w-prose font-sans text-body-lg text-text-secondary">
              {recipe.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {recipe.course && (
              <Badge variant="muted">{COURSE_LABELS[recipe.course]}</Badge>
            )}
            {cuisineName && <Badge variant="muted">{cuisineName}</Badge>}
            {recipe.difficulty && (
              <Badge>{DIFFICULTY_LABELS[recipe.difficulty]}</Badge>
            )}
            {recipe.dietaryTags?.map((tag) => (
              <Badge key={tag} variant="muted">
                {DIETARY_TAG_LABELS[tag]}
              </Badge>
            ))}
          </div>
        </header>

        {hasTime && (
          <div className="flex gap-8 border-border border-y py-4">
            {recipe.prepTime != null && (
              <div>
                <p className="font-sans text-caption text-text-muted uppercase tracking-widest">
                  Prep
                </p>
                <p className="font-sans text-body text-text-primary">
                  {formatDuration(recipe.prepTime)}
                </p>
              </div>
            )}
            {recipe.cookTime != null && (
              <div>
                <p className="font-sans text-caption text-text-muted uppercase tracking-widest">
                  Cook
                </p>
                <p className="font-sans text-body text-text-primary">
                  {formatDuration(recipe.cookTime)}
                </p>
              </div>
            )}
            {recipe.totalTime != null && (
              <div>
                <p className="font-sans text-caption text-text-muted uppercase tracking-widest">
                  Total
                </p>
                <p className="font-sans text-body text-text-primary">
                  {formatDuration(recipe.totalTime)}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="grid gap-12 lg:grid-cols-[2fr_3fr]">
          <Suspense
            fallback={
              <section>
                <h2 className="font-display text-heading-lg text-text-primary">
                  Ingredients
                </h2>
              </section>
            }
          >
            <RecipeControls
              baseYield={recipe.yield?.quantity ?? 1}
              ingredientGroups={recipe.ingredientGroups}
              yieldUnit={recipe.yield?.unit ?? ""}
            />
          </Suspense>

          <section className="space-y-6">
            <h2 className="font-display text-heading-lg text-text-primary">
              Instructions
            </h2>
            <div className="space-y-8">
              {recipe.instructionGroups.map((group, gi) => (
                <div key={group.id ?? gi}>
                  {group.groupLabel && (
                    <h3 className="mb-4 font-medium font-sans text-body-sm text-text-muted uppercase tracking-widest">
                      {group.groupLabel}
                    </h3>
                  )}
                  <ol className="space-y-6">
                    {group.steps.map((step, si) => (
                      <li className="flex gap-4" key={step.id ?? si}>
                        <span className="shrink-0 pt-0.5 font-display text-accent text-heading-md leading-none">
                          {si + 1}
                        </span>
                        <div className="space-y-2">
                          <p className="font-sans text-body text-text-primary">
                            {step.description}
                          </p>
                          {step.timerMinutes && (
                            <Badge
                              className="inline-flex items-center gap-1"
                              variant="muted"
                            >
                              <RiTimerLine aria-hidden="true" size={12} />
                              {step.timerMinutes} min
                            </Badge>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </article>
  )
}
