import electron from 'electron'

declare global {
  interface Window {
    version: string
    isLinux: boolean
    electron: typeof electron
    getCurrentWindow: () => Electron.BrowserWindow
    openMenu: (x: number, y: number) => void
    minimizeWindow: (browserWindow: Electron.BrowserWindow) => void
    maximizeWindow: (browserWindow: Electron.BrowserWindow) => void
    unmaximizeWindow: (browserWindow: Electron.BrowserWindow) => void
    maxUnmaxWindow: (browserWindow: Electron.BrowserWindow) => void
    isWindowMaximized: (browserWindow: Electron.BrowserWindow) => boolean
    closeWindow: (browserWindow: Electron.BrowserWindow) => void

    selectGameDir: () => string | null
    getGameState: () => 'installed' | 'deprecated' | 'notInstalled'

    patchGameClient: () => Promise<void>

    installGame: () => void
    uninstallGame: () => void

    launchGame: (props: {
      authkey?: string
      setGameState: (state: 'installed' | 'deprecated' | 'notInstalled' | 'running') => void
    }) => void
    startServer: (props: {
      port: number
      maxUsers: number
      secret: string
      showTerminal: boolean
      setServerState: (state: 'starting' | 'running' | 'stopped') => void
    }) => void
    stopServer: (props: {
      setServerState: (state: 'starting' | 'running' | 'stopped' | 'stopping') => void
    }) => void

    launchURL: (url: string) => void

    updateRPC: () => void
  }
}
