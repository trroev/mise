# TypeScript Conventions

These conventions follow the [TypeScript Style Guide](https://mkosir.github.io/typescript-style-guide/). Rules that can be enforced automatically are handled by Biome (see `biome.json`). The rules below are the ones that require discipline rather than tooling.

---

## Types & Type Safety

### Prefer type inference; annotate only when narrowing
Let TypeScript infer where it can. Annotate explicitly when the inferred type is too wide or when initialising state with a non-obvious type.

```ts
// ✅
const [filter, setFilter] = useState<'draft' | 'published'>('draft')

// ❌ — redundant annotation, TypeScript already knows
const title: string = 'Mise en Place'
```

### Data immutability
Prefer `Readonly<T>` for object types and `ReadonlyArray<T>` for arrays when the value should not be mutated after construction. Especially important for shared config, constants, and function parameters that shouldn't be modified.

```ts
// ✅
type Config = Readonly<{ apiKey: string; host: string }>
function processItems(items: ReadonlyArray<Item>): void { ... }
```

### Prefer discriminated unions over optional properties
Design types so that invalid states are unrepresentable. Use a discriminant field (`kind`, `status`, `type`) rather than a bag of optionals.

```ts
// ❌
type Result = { data?: Recipe; error?: string; isLoading?: boolean }

// ✅
type Result =
  | { status: 'loading' }
  | { status: 'success'; data: Recipe }
  | { status: 'error'; error: string }
```

### `as const satisfies` for constants
Declare module-level constants with `as const satisfies Type` to get both narrowing (immutable literal types) and type validation.

```ts
// ❌
const COURSES = ['appetizer', 'entrée', 'dessert']

// ✅
const COURSES = ['appetizer', 'entrée', 'dessert'] as const satisfies ReadonlyArray<string>
type Course = typeof COURSES[number]
```

### Avoid type assertions and non-null assertions
`as SomeType` and `value!` hide real bugs. If you need one, something upstream is typed too loosely — fix the source type instead.

```ts
// ❌
const recipe = data as Recipe
const title = recipe!.title

// ✅ — narrow properly
if (!data) return null
const recipe: Recipe = data
```

### Use `@ts-expect-error` with a description; never `@ts-ignore`
`@ts-expect-error` fails if the error disappears, catching stale suppressions. Always explain why.

```ts
// ❌
// @ts-ignore
doThing(badArg)

// ✅
// @ts-expect-error — third-party type definition missing the `format` overload
doThing(badArg)
```

### null vs undefined semantics
- `null` — intentional absence of a value (e.g. a field the user deliberately cleared, an optional relationship with no value set)
- `undefined` — the property doesn't exist or was never set

---

## Naming Conventions

### Booleans — use semantic prefixes
All boolean variables and props must start with `is`, `has`, `should`, `can`, `did`, or `will`.

```ts
// ❌
const loading = true
const modal = false

// ✅
const isLoading = true
const isModalOpen = false
```

### Constants — SCREAMING_SNAKE_CASE
Module-level constants (non-primitive objects and arrays used as lookup tables or config) use uppercase with underscores.

```ts
const MAX_YIELD = 100
const DEFAULT_UNIT_SYSTEM = 'metric' as const
```

### Generic type parameters — `T` prefix
All generic type parameters use a `T` prefix followed by a descriptive name. Never bare `T`, `K`, `V`.

```ts
// ❌
function transform<T, K>(input: T): K { ... }

// ✅
function transform<TInput, TOutput>(input: TInput): TOutput { ... }
```

### React event props vs handlers
- Props that accept callbacks: `on*` prefix — `onClick`, `onChange`, `onSubmit`
- Handler functions inside a component: `handle*` prefix — `handleClick`, `handleSubmit`

```ts
// ✅
<Button onClick={handleSubmit} />

function handleSubmit() { ... }
```

### Custom hook return values — always objects, never arrays
Arrays require the consumer to name values positionally, which breaks at scale. Return an object.

```ts
// ❌
function useUnitSystem() {
  return [system, setSystem] as const
}

// ✅
function useUnitSystem() {
  return { system, setSystem }
}
```

---

## Functions

### Single-object argument pattern
Functions with more than one parameter should accept a single options object instead. Enables named arguments, easier extensibility, and better IDE autocomplete.

```ts
// ❌
function formatIngredient(quantity: number, unit: string, system: string): string

// ✅
function formatIngredient({ quantity, unit, system }: FormatIngredientOptions): string
```

### Explicit return types on exported functions
All exported functions (especially in `packages/`) must have explicit return type annotations. Internal/private functions may rely on inference.

```ts
// ✅
export function scaleQuantity(quantity: number, baseYield: number, targetYield: number): number {
  return (quantity * targetYield) / baseYield
}
```

---

## React Conventions

### Maximise required props; minimise optionals
Optional props in shared/design-system components are acceptable. Optional props in feature components are a sign the component should be split.

### Avoid initialising state from props
Props used to seed state create synchronisation problems. If unavoidable, prefix the prop with `initial` to signal intent.

```ts
// ❌
function RecipeForm({ title }: { title: string }) {
  const [value, setValue] = useState(title)
}

// ✅
function RecipeForm({ initialTitle }: { initialTitle: string }) {
  const [title, setTitle] = useState(initialTitle)
}
```

### Type props inline, not with `React.FC`
`React.FC` adds an implicit `children` prop and obscures the component's actual signature.

```ts
// ❌
const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => ...

// ✅
function RecipeCard({ recipe }: RecipeCardProps) { ... }
```

---

## Pattern Matching

Use [ts-pattern](https://github.com/gvergnaud/ts-pattern) for all conditional logic that would otherwise be a `switch` statement or a chain of `if/else if`. This is enforced by `noSwitchStatement` in Biome — `switch` is a lint error.

```ts
import { match } from 'ts-pattern'

// ❌ — switch banned by Biome
switch (recipe.status) {
  case 'draft': return <DraftBadge />
  case 'published': return <PublishedBadge />
}

// ✅
match(recipe.status)
  .with('draft', () => <DraftBadge />)
  .with('published', () => <PublishedBadge />)
  .exhaustive()
```

Install ts-pattern per-package as needed (`pnpm add ts-pattern --filter <package>`), not at the workspace root.
