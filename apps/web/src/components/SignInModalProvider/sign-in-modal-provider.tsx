"use client"

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import { SignInModal } from "~/features/auth/components/SignInModal"

type RequireSignInFn = (onSuccess?: () => void) => void

type SignInModalContextValue = {
  requireSignIn: RequireSignInFn
}

const SignInModalContext = createContext<SignInModalContextValue | null>(null)

export const useRequireSignIn = (): RequireSignInFn => {
  const ctx = useContext(SignInModalContext)
  if (!ctx) {
    throw new Error(
      "useRequireSignIn must be used inside <SignInModalProvider>"
    )
  }
  return ctx.requireSignIn
}

type SignInModalProviderProps = {
  children: ReactNode
}

type ModalState = {
  open: boolean
  onSuccess: (() => void) | undefined
}

export const SignInModalProvider = ({ children }: SignInModalProviderProps) => {
  const [state, setState] = useState<ModalState>({
    open: false,
    onSuccess: undefined,
  })

  const requireSignIn = useCallback<RequireSignInFn>((onSuccess) => {
    setState({ open: true, onSuccess })
  }, [])

  const value = useMemo<SignInModalContextValue>(
    () => ({ requireSignIn }),
    [requireSignIn]
  )

  const handleOpenChange = (open: boolean): void => {
    setState((prev) => ({ open, onSuccess: open ? prev.onSuccess : undefined }))
  }

  const handleSuccess = (): void => {
    const callback = state.onSuccess
    setState({ open: false, onSuccess: undefined })
    callback?.()
  }

  return (
    <SignInModalContext.Provider value={value}>
      {children}
      <SignInModal
        onOpenChange={handleOpenChange}
        onSuccess={handleSuccess}
        open={state.open}
      />
    </SignInModalContext.Provider>
  )
}
