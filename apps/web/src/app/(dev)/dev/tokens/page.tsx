const NEUTRAL_STEPS = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
] as const

const ACCENT_STEPS = NEUTRAL_STEPS
const SAGE_STEPS = NEUTRAL_STEPS

const SEMANTIC_COLORS = [
  { name: "background", className: "bg-background" },
  { name: "surface", className: "bg-surface" },
  { name: "text-primary", className: "bg-text-primary" },
  { name: "text-secondary", className: "bg-text-secondary" },
  { name: "text-muted", className: "bg-text-muted" },
  { name: "border", className: "bg-border" },
  { name: "accent", className: "bg-accent" },
  { name: "accent-hover", className: "bg-accent-hover" },
  { name: "accent-foreground", className: "bg-accent-foreground" },
  { name: "secondary", className: "bg-secondary" },
  { name: "secondary-hover", className: "bg-secondary-hover" },
  { name: "secondary-foreground", className: "bg-secondary-foreground" },
] as const

const TYPE_SCALE = [
  { name: "display", className: "text-display font-display" },
  { name: "heading-xl", className: "text-heading-xl font-display" },
  { name: "heading-lg", className: "text-heading-lg font-display" },
  { name: "heading-md", className: "text-heading-md font-display" },
  { name: "body-lg", className: "text-body-lg" },
  { name: "body", className: "text-body" },
  { name: "body-sm", className: "text-body-sm" },
  { name: "caption", className: "text-caption" },
  { name: "label", className: "text-label uppercase tracking-widest" },
] as const

const SPACING_TOKENS = [
  { name: "xs", px: 4 },
  { name: "sm", px: 8 },
  { name: "md", px: 12 },
  { name: "lg", px: 16 },
  { name: "xl", px: 24 },
  { name: "2xl", px: 32 },
  { name: "3xl", px: 48 },
  { name: "4xl", px: 64 },
  { name: "5xl", px: 96 },
  { name: "6xl", px: 128 },
  { name: "7xl", px: 160 },
] as const

const RADIUS_TOKENS = [
  { name: "sm", px: 2 },
  { name: "md", px: 4 },
  { name: "lg", px: 8 },
  { name: "xl", px: 12 },
] as const

export default function TokensPage() {
  return (
    <main className="min-h-screen bg-background p-xl text-text-primary">
      <div className="mx-auto max-w-5xl space-y-3xl">
        <header className="space-y-sm">
          <p className="text-label text-text-muted uppercase tracking-widest">
            Mise Design System
          </p>
          <h1 className="font-display text-heading-xl">Design Tokens</h1>
          <p className="text-body text-text-secondary">
            Reference page for all tokens defined in
            <code className="text-body-sm">
              {" "}
              packages/tailwind/src/tailwind.theme.css
            </code>
            .
          </p>
        </header>

        <Section title="Color · Neutral">
          <Swatches prefix="neutral" steps={NEUTRAL_STEPS} />
        </Section>

        <Section title="Color · Accent (Terracotta)">
          <Swatches prefix="accent" steps={ACCENT_STEPS} />
        </Section>

        <Section title="Color · Secondary (Sage)">
          <Swatches prefix="sage" steps={SAGE_STEPS} />
        </Section>

        <Section title="Color · Semantic">
          <div className="grid grid-cols-2 gap-md sm:grid-cols-3">
            {SEMANTIC_COLORS.map((c) => (
              <div
                className="rounded-md border border-border p-sm"
                key={c.name}
              >
                <div
                  className={`${c.className} h-12 w-full rounded-sm border border-border`}
                />
                <p className="mt-xs font-mono text-caption">{c.name}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Typography · Scale">
          <div className="space-y-md">
            {TYPE_SCALE.map((t) => (
              <div
                className="flex items-baseline gap-lg border-border border-b pb-md"
                key={t.name}
              >
                <span className="w-32 shrink-0 font-mono text-caption text-text-muted">
                  {t.name}
                </span>
                <span className={t.className}>The quick brown fox</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Spacing">
          <div className="space-y-sm">
            {SPACING_TOKENS.map((s) => (
              <div className="flex items-center gap-md" key={s.name}>
                <span className="w-16 shrink-0 font-mono text-caption text-text-muted">
                  {s.name}
                </span>
                <span className="w-16 shrink-0 font-mono text-caption text-text-muted">
                  {s.px}px
                </span>
                <div className="h-4 bg-accent" style={{ width: `${s.px}px` }} />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Border Radius">
          <div className="flex flex-wrap gap-lg">
            {RADIUS_TOKENS.map((r) => (
              <div className="flex flex-col items-center gap-xs" key={r.name}>
                <div
                  className="h-20 w-20 border border-border bg-surface"
                  style={{ borderRadius: `${r.px}px` }}
                />
                <p className="font-mono text-caption text-text-muted">
                  {r.name} · {r.px}px
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Font Families">
          <div className="space-y-md">
            <p className="font-display text-heading-md">
              Cormorant Garamond — display
            </p>
            <p className="font-sans text-body">Inter — sans</p>
          </div>
        </Section>
      </div>
    </main>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-lg">
      <h2 className="border-border border-b pb-sm font-display text-heading-md">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Swatches({
  prefix,
  steps,
}: {
  prefix: string
  steps: ReadonlyArray<string>
}) {
  return (
    <div className="grid grid-cols-5 gap-md sm:grid-cols-10">
      {steps.map((step) => (
        <div className="space-y-xs" key={step}>
          <div
            className="h-16 w-full rounded-sm border border-border"
            style={{ background: `var(--color-${prefix}-${step})` }}
          />
          <p className="font-mono text-caption text-text-muted">
            {prefix}-{step}
          </p>
        </div>
      ))}
    </div>
  )
}
