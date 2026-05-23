import type { User } from "@mise/auth"
import { SessionProvider } from "@mise/auth/session"
import {
  type RenderOptions,
  type RenderResult,
  render,
} from "@testing-library/react"
import type { ComponentType, ReactElement, ReactNode } from "react"

export {
  mockNextImage,
  mockNextLink,
  mockNextNavigation,
} from "./next-mocks"

type RenderWithProvidersOptions = {
  initialUser?: User | null
  wrapper?: ComponentType<{ children: ReactNode }>
} & Omit<RenderOptions, "wrapper">

const buildWrapper = (
  initialUser: User | null,
  Outer?: ComponentType<{ children: ReactNode }>
): ComponentType<{ children: ReactNode }> => {
  const Wrapper = ({ children }: { children: ReactNode }) => {
    const inner = (
      <SessionProvider initialUser={initialUser}>{children}</SessionProvider>
    )
    return Outer ? <Outer>{inner}</Outer> : inner
  }
  return Wrapper
}

export const renderWithProviders = (
  ui: ReactElement,
  options: RenderWithProvidersOptions = {}
): RenderResult => {
  const { initialUser = null, wrapper, ...rest } = options
  return render(ui, { wrapper: buildWrapper(initialUser, wrapper), ...rest })
}
