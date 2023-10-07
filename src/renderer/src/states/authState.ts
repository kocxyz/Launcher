import { create } from 'zustand'

interface AuthState {
  authState: boolean
  username: string

  setAuthState: (authState: boolean) => void
  setUsername: (username: string) => void
}

export const useAuthState = create<AuthState>((set) => ({
  authState: localStorage.getItem('authState') === 'true' || false,
  username: localStorage.getItem('username') || '',
  setAuthState: (authState): void => {
    set(() => ({ authState: authState }))
  },
  setUsername: (username): void => {
    set(() => ({ username: username }))
  }
}))
