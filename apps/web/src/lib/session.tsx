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
  const user = (data?.user as User | undefined) ?? initialUser
  return {
    user,
    isLoading: isPending && initialUser === null,
    isAuthenticated: user !== null,
  }
}
