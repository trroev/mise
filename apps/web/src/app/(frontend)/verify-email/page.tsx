import type { Metadata } from "next"
import { VerifyEmailErrorBoundary } from "~/features/auth/components/VerifyEmailErrorBoundary"
import { VerifyEmailStatus } from "~/features/auth/components/VerifyEmailStatus"

export const metadata: Metadata = {
  title: "Verify Email",
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return (
    <section className="constrainer flex flex-col items-center py-16">
      <div className="w-full max-w-sm space-y-6">
        <VerifyEmailErrorBoundary>
          <VerifyEmailStatus errorCode={error} />
        </VerifyEmailErrorBoundary>
      </div>
    </section>
  )
}
