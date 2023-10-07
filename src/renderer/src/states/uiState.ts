import { create } from 'zustand'

interface UIState {
  popUpState: string | false
  setPopUpState: (popUpState: string | false) => void
}

export const useUIState = create<UIState>((set) => ({
  popUpState: false,
  setPopUpState: (popUpState: string | false): void => {
    set(() => ({ popUpState: popUpState }))
  }
}))
