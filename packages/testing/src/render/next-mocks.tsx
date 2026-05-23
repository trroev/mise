import { createElement, type ImgHTMLAttributes, type ReactNode } from "react"
import { vi } from "vitest"

export type NextNavigationMock = {
  push: ReturnType<typeof vi.fn>
  replace: ReturnType<typeof vi.fn>
  back: ReturnType<typeof vi.fn>
  forward: ReturnType<typeof vi.fn>
  refresh: ReturnType<typeof vi.fn>
  prefetch: ReturnType<typeof vi.fn>
  pathname: string
  searchParams: URLSearchParams
}

const buildNavigationMock = (
  pathname = "/",
  searchParams = new URLSearchParams()
): NextNavigationMock => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
  pathname,
  searchParams,
})

export const mockNextNavigation = (
  initial?: Readonly<{ pathname?: string; searchParams?: URLSearchParams }>
): NextNavigationMock => {
  const state = buildNavigationMock(initial?.pathname, initial?.searchParams)
  vi.mock("next/navigation", () => ({
    useRouter: () => ({
      push: state.push,
      replace: state.replace,
      back: state.back,
      forward: state.forward,
      refresh: state.refresh,
      prefetch: state.prefetch,
    }),
    usePathname: () => state.pathname,
    useSearchParams: () => state.searchParams,
    useParams: () => ({}),
    redirect: vi.fn(),
    notFound: vi.fn(),
  }))
  return state
}

type LinkProps = {
  href: string
  children?: ReactNode
} & Record<string, unknown>

export const mockNextLink = (): void => {
  vi.mock("next/link", () => ({
    default: ({ href, children, ...rest }: LinkProps) =>
      createElement(
        "a",
        { href: typeof href === "string" ? href : "#", ...rest },
        children
      ),
  }))
}

export const mockNextImage = (): void => {
  vi.mock("next/image", () => ({
    default: (props: ImgHTMLAttributes<HTMLImageElement>) =>
      createElement("img", { alt: props.alt ?? "", ...props }),
  }))
}
