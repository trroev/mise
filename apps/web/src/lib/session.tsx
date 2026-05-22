"use client"

import type { User } from "@mise/auth"
import { createContext, type ReactNode, useContext } from "react"
import { authClient } from "~/lib/auth-client"

type SessionContextValue = {
  initialUser: User | null
}

const SessionContext = createContext<SessionContextValue>({ initialUser: null })

type SessionProviderProps = {
  initialUser: User | null
  children: ReactNode
}

export const SessionProvider = ({
  initialUser,
  children,
}: SessionProviderProps) => (
  <SessionContext.Provider value={{ initialUser }}>
    {children}
  </SessionContext.Provider>
)

type UseSessionResult = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export const useSession = (): UseSessionResult => {
  const { initialUser } = useContext(SessionContext)
  const { data, isPending } = authClient.useSession()

  // While the client query is in flight, the server-rendered `initialUser`
  // is authoritative — this avoids a signed-in → signed-out → signed-in
  // flicker on hard refresh. Once the client has resolved (isPending=false),
  // its result is the source of truth, so an actual sign-out is reflected
  // without requiring a navigation.
  const clientUser = (data?.user as User | null | undefined) ?? null
  const user = isPending ? initialUser : clientUser

  return {
    user,
    isLoading: isPending && initialUser === null,
    isAuthenticated: user !== null,
  }
}
