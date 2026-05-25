import { buildRecipeJsonLd } from "@mise/chrome/utils/buildRecipeJsonLd"
import {
  COURSE_LABELS,
  DIETARY_TAG_LABELS,
  DIFFICULTY_LABELS,
} from "@mise/chrome/utils/recipeLabels"
import { transformCloudinary } from "@mise/chrome/utils/transformCloudinary"
import { env as appEnv } from "@mise/env/app"
import { Badge } from "@mise/ui/components/Badge"
import { formatDuration } from "@mise/utils/formatDuration"
import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { JsonLd } from "react-schemaorg"
import type { Recipe as RecipeSchema } from "schema-dts"
import { match, P } from "ts-pattern"
import { AddToCollectionButton } from "~/features/collections/components/AddToCollectionButton"
import { getPublishedRecipes } from "~/features/recipes/api/published-recipes"
import {
  getDraftRecipeBySlug,
  getRecipeBySlug,
} from "~/features/recipes/api/recipe-by-slug"
import { FocusMode } from "~/features/recipes/components/FocusMode"
import { RecipeControls } from "~/features/recipes/components/RecipeControls"
import { RefreshRouteOnSave } from "~/features/recipes/components/RefreshRouteOnSave"
import { SendToPhone } from "~/features/recipes/components/SendToPhone"
import {
  StepProgress,
  type StepProgressGroup,
} from "~/features/recipes/components/StepProgress"
import type { StepProgressStorageKey } from "~/features/recipes/hooks/use-checklist-state"
import { SaveButton } from "~/features/saved-recipes/components/SaveButton"
import { canViewDraft } from "~/lib/policies/can-view-draft"
import { getCurrentViewer } from "~/lib/queries/current-viewer"

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string }>
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const recipes = await getPublishedRecipes()
  return recipes.map((recipe) => ({ slug: recipe.slug }))
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { slug } = await params
  const { preview } = await searchParams
  if (preview === "draft") {
    return { title: "Preview", robots: { index: false, follow: false } }
  }
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
    ? transformCloudinary({
        url: rawImageUrl,
        width: 1200,
        height: 630,
      })
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

export default async function RecipeDetailPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params
  const { preview } = await searchParams
  const isPreview = preview === "draft"

  const recipe = await match(isPreview)
    .with(true, async () => {
      const draft = await getDraftRecipeBySlug(slug)
      if (!draft) {
        return null
      }
      const viewer = await getCurrentViewer()
      return canViewDraft(viewer, draft) ? draft : null
    })
    .otherwise(() => getRecipeBySlug(slug))

  if (!recipe) {
    notFound()
  }

  const { heroUrl, heroAlt } = match(recipe.heroImage)
    .with({ url: P.string }, (img) => ({ heroUrl: img.url, heroAlt: img.alt }))
    .otherwise(() => ({ heroUrl: null, heroAlt: recipe.title }))

  const cuisineName = match(recipe.cuisine)
    .with({ name: P.string }, (c) => c.name)
    .otherwise(() => null)

  const authorName = match(recipe)
    .with(
      { authorUser: { name: P.string.select() } },
      (name) => name.trim() ?? null
    )
    .with({ author: P.string.select() }, (name) => name.trim() ?? null)
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

  const ingredientsSlot = (
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
        recipeSlug={slug}
        yieldUnit={recipe.yield?.unit ?? ""}
      />
    </Suspense>
  )

  const stepProgressGroups = recipe.instructionGroups.map<StepProgressGroup>(
    (group, gi) => ({
      id: group.id ?? `group-${gi}`,
      groupLabel: group.groupLabel,
      steps: group.steps.map((step, si) => ({
        id: step.id ?? `${group.id ?? gi}-${si}`,
        description: step.description,
        timerMinutes: step.timerMinutes,
      })),
    })
  )

  const instructionsSlot = (
    <section className="space-y-6">
      <h2 className="font-display text-heading-lg text-text-primary">
        Instructions
      </h2>
      <StepProgress
        groups={stepProgressGroups}
        storageKey={`step-progress:${slug}` satisfies StepProgressStorageKey}
      />
    </section>
  )

  return (
    <FocusMode ingredients={ingredientsSlot} instructions={instructionsSlot}>
      <article>
        {isPreview && <RefreshRouteOnSave serverURL={appEnv.BASE_URL} />}
        <JsonLd<RecipeSchema> item={buildRecipeJsonLd(recipe)} />
        {heroUrl && (
          <div className="relative aspect-video w-full overflow-hidden bg-surface print:hidden">
            <Image
              alt={heroAlt}
              className="object-cover"
              fill
              priority
              sizes="100vw"
              src={transformCloudinary({
                url: heroUrl,
                width: 1600,
                aspect: "16:9",
              })}
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
            {authorName && (
              <p className="font-sans text-body-sm text-text-muted">
                By {authorName}
              </p>
            )}
            <p className="hidden font-sans text-body-sm text-text-muted print:block">
              Source: {`${appEnv.BASE_URL}/recipes/${slug}`}
            </p>
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <SaveButton recipeId={recipe.id} />
              <AddToCollectionButton recipeId={recipe.id} />
              <SendToPhone origin={appEnv.BASE_URL} slug={slug} />
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

          <div className="grid gap-12 lg:grid-cols-[2fr_3fr] print:grid-cols-1 print:gap-6">
            {ingredientsSlot}
            {instructionsSlot}
          </div>
        </div>
      </article>
    </FocusMode>
  )
}
