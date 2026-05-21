import { COURSE_LABELS } from "@mise/features/utils/recipeLabels"
import { transformCloudinary } from "@mise/features/utils/transformCloudinary"
import type { Recipe } from "@mise/payload/payload-types"
import { Badge } from "@mise/ui/components/Badge"
import { Button } from "@mise/ui/components/Button"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { match, P } from "ts-pattern"
import { getHomepage } from "~/lib/queries/homepage"

export async function generateMetadata(): Promise<Metadata> {
  const homepage = await getHomepage()
  return {
    title: { absolute: `${homepage.heroHeadline} | Mise` },
    description: homepage.heroTagline ?? undefined,
    openGraph: {
      title: homepage.heroHeadline,
      description: homepage.heroTagline ?? undefined,
    },
  }
}

export default async function HomePage() {
  const homepage = await getHomepage()

  const heroImage = match(homepage.heroImage)
    .with(
      { url: P.string, width: P.number, height: P.number },
      ({ url, alt, width, height }) => ({
        url,
        alt: alt ?? homepage.heroHeadline,
        width,
        height,
      })
    )
    .with({ url: P.string }, ({ url, alt }) => ({
      url,
      alt: alt ?? homepage.heroHeadline,
      width: 1600,
      height: 1200,
    }))
    .otherwise(() => null)

  const featured = match(homepage.featuredRecipe)
    .with(P.string, () => null)
    .otherwise((recipe) => recipe)

  return (
    <main>
      <section className="constrainer py-10 lg:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-6">
            <h1 className="font-display text-heading-xl text-text-primary lg:text-heading-2xl">
              {homepage.heroHeadline}
            </h1>
            {homepage.heroTagline && (
              <p className="max-w-prose font-sans text-body-lg text-text-secondary">
                {homepage.heroTagline}
              </p>
            )}
            {homepage.heroCtaLabel && homepage.heroCtaHref && (
              <div>
                <Button render={<Link href={homepage.heroCtaHref} />}>
                  {homepage.heroCtaLabel}
                </Button>
              </div>
            )}
          </div>
          {heroImage && (
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-md bg-surface">
              <Image
                alt={heroImage.alt}
                className="object-cover"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                src={transformCloudinary({
                  url: heroImage.url,
                  transform: "f_auto,q_auto,c_fill,g_auto,w_1200,h_900",
                })}
              />
            </div>
          )}
        </div>
      </section>

      {featured && <FeaturedRecipe recipe={featured} />}
    </main>
  )
}

function FeaturedRecipe({ recipe }: { recipe: Recipe }) {
  const heroImage = match(recipe.heroImage)
    .with({ url: P.string }, (img) => ({
      url: img.url,
      alt: img.alt ?? recipe.title,
    }))
    .otherwise(() => null)

  const cuisineName = match(recipe.cuisine)
    .with({ name: P.string }, (c) => c.name)
    .otherwise(() => null)

  return (
    <section className="constrainer pb-16">
      <p className="mb-4 font-sans text-caption text-text-muted uppercase tracking-widest">
        Featured recipe
      </p>
      <Link
        className="group grid gap-8 overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:grid-cols-[3fr_2fr] lg:gap-12"
        href={`/recipes/${recipe.slug}`}
      >
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-surface lg:aspect-4/3">
          {heroImage && (
            <Image
              alt={heroImage.alt}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              src={transformCloudinary({
                url: heroImage.url,
                transform: "f_auto,q_auto,c_fill,g_auto,w_1400,h_1050",
              })}
            />
          )}
        </div>
        <div className="flex flex-col justify-center space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {recipe.course && (
              <Badge variant="muted">{COURSE_LABELS[recipe.course]}</Badge>
            )}
            {cuisineName && <Badge variant="muted">{cuisineName}</Badge>}
          </div>
          <h2 className="font-display text-heading-lg text-text-primary lg:text-heading-xl">
            {recipe.title}
          </h2>
          {recipe.description && (
            <p className="max-w-prose font-sans text-body text-text-secondary">
              {recipe.description}
            </p>
          )}
        </div>
      </Link>
    </section>
  )
}
