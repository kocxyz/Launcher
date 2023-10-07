import { create } from 'zustand'

interface SelectedServerState {
  currServer: string
  currServerName: string
  currServerType: string

  setCurrServer: (server: string) => void
  setCurrServerName: (serverName: string) => void
  setCurrServerType: (serverType: string) => void
}

export const useSelectedServerState = create<SelectedServerState>((set) => ({
  currServer: localStorage.getItem('currServer') || '',
  currServerName: localStorage.getItem('currServerName') || '',
  currServerType: localStorage.getItem('currServerType') || 'private',

  setCurrServer: (server): void => {
    set(() => ({ currServer: server }))
    localStorage.setItem('currServer', server)
  },
  setCurrServerName: (serverName): void => {
    set(() => ({ currServerName: serverName }))
    localStorage.setItem('currServerName', serverName)
  },
  setCurrServerType: (serverType): void => {
    set(() => ({ currServerType: serverType }))
    localStorage.setItem('currServerType', serverType)
  }
}))
