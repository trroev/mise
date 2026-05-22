import { SentryTestButtons } from "./sentry-test-buttons"

export default async function SentryTestPage({
  searchParams,
}: {
  searchParams: Promise<{ throw?: string }>
}) {
  const { throw: shouldThrow } = await searchParams
  if (shouldThrow === "server") {
    throw new Error("Sentry test: deliberate server error")
  }
  return (
    <section className="constrainer flex flex-col items-start space-y-4 py-16">
      <h1 className="font-display text-heading-xl text-text-primary">
        Sentry test
      </h1>
      <p className="max-w-prose font-sans text-body text-text-muted">
        Deliberately throw an error to verify Sentry receives it. Remove this
        route once verified.
      </p>
      <SentryTestButtons />
    </section>
  )
}
