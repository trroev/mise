import { Badge } from "@mise/ui/components/badge"
import { Button } from "@mise/ui/components/button"
import { Checkbox } from "@mise/ui/components/checkbox"
import { Field } from "@mise/ui/components/field"
import { Input } from "@mise/ui/components/input"
import { Label } from "@mise/ui/components/label"
import { Select } from "@mise/ui/components/select"
import { Skeleton } from "@mise/ui/components/skeleton"
import { Spinner } from "@mise/ui/components/spinner"
import { Switch } from "@mise/ui/components/switch"
import { Textarea } from "@mise/ui/components/textarea"
import type { ReactNode } from "react"

const COURSE_OPTIONS = [
  { value: "starter", label: "Starter" },
  { value: "main", label: "Main" },
  { value: "dessert", label: "Dessert" },
] as const

export default function ComponentsPage() {
  return (
    <main className="min-h-screen bg-background p-8 text-text-primary">
      <div className="mx-auto max-w-5xl space-y-12">
        <header className="space-y-2">
          <p className="text-label text-text-muted uppercase tracking-widest">
            Mise Design System
          </p>
          <h1 className="font-display text-heading-xl">UI Primitives</h1>
          <p className="text-body text-text-secondary">
            Visual reference for every primitive in{" "}
            <code className="text-body-sm">@mise/ui/components</code>. Each
            primitive is shown in light and dark, in every variant and state.
          </p>
        </header>

        <Mode label="Light">
          <Gallery />
        </Mode>
        <Mode dark label="Dark">
          <Gallery />
        </Mode>
      </div>
    </main>
  )
}

function Mode({
  dark = false,
  label,
  children,
}: {
  dark?: boolean
  label: string
  children: ReactNode
}) {
  return (
    <section
      className={`${dark ? "dark" : ""} rounded-lg border border-border bg-background p-8`}
    >
      <p className="mb-6 font-mono text-caption text-text-muted uppercase tracking-widest">
        {label}
      </p>
      <div className="space-y-10 text-text-primary">{children}</div>
    </section>
  )
}

function Gallery() {
  return (
    <>
      <Section title="Button — variants">
        <Row>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </Row>
      </Section>

      <Section title="Button — sizes">
        <Row>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button aria-label="Add" size="icon">
            +
          </Button>
        </Row>
      </Section>

      <Section title="Button — states">
        <Row>
          <Button>Default</Button>
          <Button disabled>Disabled</Button>
          <Button render={<a href="/recipes">Render as link</a>} />
        </Row>
      </Section>

      <Section title="Badge">
        <Row>
          <Badge>Default</Badge>
          <Badge variant="muted">Muted</Badge>
        </Row>
      </Section>

      <Section title="Spinner">
        <Row>
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </Row>
      </Section>

      <Section title="Skeleton">
        <div className="space-y-3">
          <Skeleton variant="block" />
          <div className="space-y-2">
            <Skeleton variant="text" />
            <Skeleton variant="text" />
            <Skeleton variant="text" />
          </div>
        </div>
      </Section>

      <Section title="Input — states">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field hint="Up to 80 characters." label="Recipe name">
            <Input id="name" placeholder="e.g. Cassoulet" />
          </Field>
          <Field error="This field is required." label="Recipe name">
            <Input id="name-error" placeholder="e.g. Cassoulet" />
          </Field>
          <Field label="Disabled">
            <Input disabled placeholder="Disabled" />
          </Field>
          <div className="space-y-2">
            <Label htmlFor="standalone">Standalone (inline error)</Label>
            <Input
              error="Inline error message"
              id="standalone"
              placeholder="Standalone"
            />
          </div>
        </div>
      </Section>

      <Section title="Textarea">
        <Field hint="Step-by-step instructions." label="Method">
          <Textarea id="method" placeholder="Bring water to a boil…" />
        </Field>
      </Section>

      <Section title="Select">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Course">
            <Select id="course" options={COURSE_OPTIONS} />
          </Field>
          <Field error="Please choose a course." label="Course">
            <Select id="course-error" options={COURSE_OPTIONS} />
          </Field>
        </div>
      </Section>

      <Section title="Checkbox">
        <Row>
          <CheckboxLabel id="cb-default">Default</CheckboxLabel>
          <CheckboxLabel defaultChecked id="cb-checked">
            Checked
          </CheckboxLabel>
          <CheckboxLabel disabled id="cb-disabled">
            Disabled
          </CheckboxLabel>
        </Row>
      </Section>

      <Section title="Switch (metric / US)">
        <Row>
          <SwitchLabel id="sw-off">Default off</SwitchLabel>
          <SwitchLabel defaultChecked id="sw-on">
            Default on
          </SwitchLabel>
          <SwitchLabel disabled id="sw-disabled">
            Disabled
          </SwitchLabel>
        </Row>
      </Section>
    </>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="border-border border-b pb-2 font-display text-heading-md">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-4">{children}</div>
}

function CheckboxLabel({
  id,
  children,
  defaultChecked,
  disabled,
}: {
  id: string
  children: ReactNode
  defaultChecked?: boolean
  disabled?: boolean
}) {
  return (
    <span className={`flex items-center gap-2 ${disabled ? "opacity-70" : ""}`}>
      <Checkbox defaultChecked={defaultChecked} disabled={disabled} id={id} />
      <Label className="cursor-pointer" htmlFor={id}>
        {children}
      </Label>
    </span>
  )
}

function SwitchLabel({
  id,
  children,
  defaultChecked,
  disabled,
}: {
  id: string
  children: ReactNode
  defaultChecked?: boolean
  disabled?: boolean
}) {
  return (
    <span className={`flex items-center gap-3 ${disabled ? "opacity-70" : ""}`}>
      <Switch defaultChecked={defaultChecked} disabled={disabled} id={id} />
      <Label className="cursor-pointer" htmlFor={id}>
        {children}
      </Label>
    </span>
  )
}
