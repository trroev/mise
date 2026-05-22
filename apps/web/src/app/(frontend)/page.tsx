import { transformCloudinary } from "@mise/chrome/utils/transformCloudinary"
import { Button } from "@mise/ui/components/Button"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { match, P } from "ts-pattern"
import { FeaturedRecipe } from "~/components/FeaturedRecipe"
import { LatestRecipes } from "~/components/LatestRecipes"
import { getHomepage } from "~/lib/queries/homepage"
import { getLatestRecipes } from "~/lib/queries/latest-recipes"

const LATEST_RECIPES_LIMIT = 6

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

  const latestRecipes = await getLatestRecipes({
    limit: LATEST_RECIPES_LIMIT,
    excludeId: featured?.id,
  })

  return (
    <>
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
                <Button
                  nativeButton={false}
                  render={<Link href={homepage.heroCtaHref} />}
                >
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

      <LatestRecipes recipes={latestRecipes} />
    </>
  )
}
