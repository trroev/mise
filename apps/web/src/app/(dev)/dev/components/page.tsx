import type { Recipe } from "@mise/payload/payload-types"
import { Badge } from "@mise/ui/components/Badge"
import { Button } from "@mise/ui/components/Button"
import { Checkbox } from "@mise/ui/components/Checkbox"
import { Dialog } from "@mise/ui/components/Dialog"
import { Field } from "@mise/ui/components/Field"
import { Input } from "@mise/ui/components/Input"
import { Label } from "@mise/ui/components/Label"
import { Pagination } from "@mise/ui/components/Pagination"
import { RadioGroup } from "@mise/ui/components/RadioGroup"
import { RecipeCard } from "@mise/ui/components/RecipeCard"
import { Select } from "@mise/ui/components/Select"
import { Skeleton } from "@mise/ui/components/Skeleton"
import { Spinner } from "@mise/ui/components/Spinner"
import { Switch } from "@mise/ui/components/Switch"
import { Tabs } from "@mise/ui/components/Tabs"
import { Textarea } from "@mise/ui/components/Textarea"
import { Toggle } from "@mise/ui/components/Toggle"
import { ToggleGroup } from "@mise/ui/components/ToggleGroup"
import { Tooltip } from "@mise/ui/components/Tooltip"
import type { ReactNode } from "react"

const COURSE_OPTIONS = [
  { value: "starter", label: "Starter" },
  { value: "main", label: "Main" },
  { value: "dessert", label: "Dessert" },
] as const

const SAMPLE_RECIPE_BASE = {
  id: "sample",
  generateSlug: false,
  description: null,
  cuisine: null,
  dietaryTags: null,
  prepTime: null,
  cookTime: null,
  yield: { quantity: null, unit: null },
  ingredientGroups: [],
  instructionGroups: [],
  createdAt: "",
  updatedAt: "",
} satisfies Partial<Recipe>

const SAMPLE_RECIPES: ReadonlyArray<Recipe> = [
  {
    ...SAMPLE_RECIPE_BASE,
    id: "1",
    title: "Cassoulet de Toulouse",
    slug: "cassoulet-de-toulouse",
    course: "entrée",
    difficulty: "hard",
    totalTime: 240,
    heroImage: null,
  } as Recipe,
  {
    ...SAMPLE_RECIPE_BASE,
    id: "2",
    title: "Pâte brisée",
    slug: "pate-brisee",
    course: "bread",
    difficulty: "easy",
    totalTime: 45,
    heroImage: null,
  } as Recipe,
  {
    ...SAMPLE_RECIPE_BASE,
    id: "3",
    title: "Tarte au citron",
    slug: "tarte-au-citron",
    course: "dessert",
    difficulty: "medium",
    totalTime: 75,
    heroImage: null,
  } as Recipe,
]

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

const noop = () => undefined

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
          <Button
            nativeButton={false}
            render={<a href="/recipes">Render as link</a>}
          />
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

      <Section title="RadioGroup">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Course">
            <RadioGroup
              defaultValue="main"
              name="course"
              options={[
                { value: "starter", label: "Starter" },
                { value: "main", label: "Main" },
                { value: "dessert", label: "Dessert" },
              ]}
            />
          </Field>
          <Field label="With disabled option">
            <RadioGroup
              defaultValue="main"
              name="course-disabled"
              options={[
                { value: "starter", label: "Starter" },
                { value: "main", label: "Main" },
                { value: "dessert", label: "Dessert", disabled: true },
              ]}
            />
          </Field>
        </div>
      </Section>

      <Section title="Toggle">
        <Row>
          <Toggle aria-label="Toggle bold">B</Toggle>
          <Toggle aria-label="Toggle italic" defaultPressed>
            I
          </Toggle>
          <Toggle aria-label="Toggle ghost" variant="ghost">
            Ghost
          </Toggle>
          <Toggle aria-label="Toggle ghost on" defaultPressed variant="ghost">
            Ghost on
          </Toggle>
          <Toggle aria-label="Toggle disabled" disabled>
            Disabled
          </Toggle>
        </Row>
      </Section>

      <Section title="ToggleGroup — single (view mode)">
        <ToggleGroup.Root defaultValue={["list"]}>
          <ToggleGroup.Item value="list">List</ToggleGroup.Item>
          <ToggleGroup.Item value="grid">Grid</ToggleGroup.Item>
        </ToggleGroup.Root>
      </Section>

      <Section title="ToggleGroup — multiple">
        <ToggleGroup.Root defaultValue={["bold"]} multiple>
          <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>
          <ToggleGroup.Item value="italic">Italic</ToggleGroup.Item>
          <ToggleGroup.Item value="underline">Underline</ToggleGroup.Item>
        </ToggleGroup.Root>
      </Section>

      <Section title="Tabs">
        <Tabs.Root defaultValue="overview">
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="ingredients">Ingredients</Tabs.Tab>
            <Tabs.Tab value="method">Method</Tabs.Tab>
            <Tabs.Tab disabled value="notes">
              Notes
            </Tabs.Tab>
            <Tabs.Indicator />
          </Tabs.List>
          <Tabs.Panel value="overview">
            <p className="text-body text-text-secondary">
              A panel describing the recipe at a high level.
            </p>
          </Tabs.Panel>
          <Tabs.Panel value="ingredients">
            <p className="text-body text-text-secondary">
              The ingredient list goes here.
            </p>
          </Tabs.Panel>
          <Tabs.Panel value="method">
            <p className="text-body text-text-secondary">
              Step-by-step method goes here.
            </p>
          </Tabs.Panel>
        </Tabs.Root>
      </Section>

      <Section title="Tooltip">
        <Row>
          <Tooltip content="Top tooltip">
            <Button variant="outline">Hover top</Button>
          </Tooltip>
          <Tooltip content="Right tooltip" side="right">
            <Button variant="outline">Hover right</Button>
          </Tooltip>
          <Tooltip content="Bottom tooltip" side="bottom">
            <Button variant="outline">Hover bottom</Button>
          </Tooltip>
        </Row>
      </Section>

      <Section title="RecipeCard">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_RECIPES.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </Section>

      <Section title="Pagination — few pages">
        <div className="space-y-4">
          <Pagination currentPage={1} onPageChange={noop} totalPages={5} />
          <Pagination currentPage={3} onPageChange={noop} totalPages={5} />
          <Pagination currentPage={5} onPageChange={noop} totalPages={5} />
        </div>
      </Section>

      <Section title="Pagination — many pages (ellipsis)">
        <div className="space-y-4">
          <Pagination currentPage={1} onPageChange={noop} totalPages={20} />
          <Pagination currentPage={10} onPageChange={noop} totalPages={20} />
          <Pagination currentPage={20} onPageChange={noop} totalPages={20} />
        </div>
      </Section>

      <Section title="Dialog">
        <Dialog.Root>
          <Dialog.Trigger
            render={<Button variant="outline">Open dialog</Button>}
          />
          <Dialog.Portal>
            <Dialog.Backdrop />
            <Dialog.Popup>
              <Dialog.Title>Discard recipe?</Dialog.Title>
              <Dialog.Description>
                Your unsaved changes will be lost. This action cannot be undone.
              </Dialog.Description>
              <div className="mt-6 flex justify-end gap-2">
                <Dialog.Close
                  render={<Button variant="ghost">Cancel</Button>}
                />
                <Dialog.Close
                  render={<Button variant="destructive">Discard</Button>}
                />
              </div>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
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
    <span className="flex items-center gap-2">
      <Checkbox
        className="peer"
        defaultChecked={defaultChecked}
        disabled={disabled}
        id={id}
      />
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
    <span className="flex items-center gap-3">
      <Switch
        className="peer"
        defaultChecked={defaultChecked}
        disabled={disabled}
        id={id}
      />
      <Label className="cursor-pointer" htmlFor={id}>
        {children}
      </Label>
    </span>
  )
}
