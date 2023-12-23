import { ipcRenderer } from 'electron'
import { getCurrentWindow } from '@electron/remote'
import { BrowserWindow } from 'electron'
const os = require('os')

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.

// @ts-ignore (define in dts)
window.isLinux = os.platform() === 'linux'

if (!localStorage.getItem('username')) {
  // get username from system
  const username = os.userInfo().username
  localStorage.setItem('username', username)
}
if (!localStorage.getItem('gameVersion')) localStorage.setItem('gameVersion', '1')
if (!localStorage.getItem('language')) localStorage.setItem('language', 'en')
if (!localStorage.getItem('currServerName')) localStorage.setItem('currServerName', 'localhost')
if (!localStorage.getItem('currServer')) localStorage.setItem('currServer', '127.0.0.1')
if (localStorage.getItem('servers') === null)
  localStorage.setItem('servers', '[{"name":"localhost","ip":"127.0.0.1"}]')
if (!localStorage.getItem('gameDirectory'))
  localStorage.setItem(
    'gameDirectory',
    os.Platform() === 'win32' ? 'C:/Program Files/KOCity' : `${os.homedir()}/Games/KOCity`
  )

if (localStorage.getItem('discordRPC:enabled') === null)
  localStorage.setItem('discordRPC:enabled', 'true')
if (localStorage.getItem('discordRPC:displayName') === null)
  localStorage.setItem('discordRPC:displayName', 'true')
if (localStorage.getItem('discordRPC:allowJoining') === null)
  localStorage.setItem('discordRPC:allowJoining', 'true')

// catch a STRG + R
document.addEventListener('keydown', (e) => {
  if (e.key === 'r' && e.ctrlKey) {
    e.preventDefault()
  }
  // f5
  if (e.key === 'F5') {
    e.preventDefault()
  }
})
// @ts-ignore (define in dts)
window.updateRPC = async (): void => {
  ipcRenderer.sendSync('set-RPCstate', {
    enabled: localStorage.getItem('discordRPC:enabled') === 'true',
    displayName: localStorage.getItem('discordRPC:displayName') === 'true',
    allowJoining: localStorage.getItem('discordRPC:allowJoining') === 'true'
  })
}
// @ts-ignore (define in dts)
window.updateRPC()

window.addEventListener('DOMContentLoaded', () => {
  // @ts-ignore (define in dts)
  window.getCurrentWindow = (): BrowserWindow => {
    return getCurrentWindow()
  }
  // @ts-ignore (define in dts)
  window.openMenu = (x: number, y: number): void => {
    ipcRenderer.send('open-menu', { x, y })
  }
  // @ts-ignore (define in dts)
  window.minimizeWindow = (browserWindow = getCurrentWindow()): void => {
    if (browserWindow.isMinimizable()) browserWindow.minimize()
  }
  // @ts-ignore (define in dts)
  window.maximizeWindow = (browserWindow = getCurrentWindow()): void => {
    if (browserWindow.isMaximizable()) browserWindow.maximize()
  }
  // @ts-ignore (define in dts)
  window.unmaximizeWindow = (unmaximizeWindow = getCurrentWindow()): void => {
    if (unmaximizeWindow.isMaximized()) unmaximizeWindow.unmaximize()
  }
  // @ts-ignore (define in dts)
  window.maxUnmaxWindow = (browserWindow = getCurrentWindow()): void => {
    if (browserWindow.isMaximized()) browserWindow.unmaximize()
    else browserWindow.maximize()
  }
  // @ts-ignore (define in dts)
  window.isWindowMaximized = (browserWindow = getCurrentWindow()): boolean => {
    return browserWindow.isMaximized()
  }
  // @ts-ignore (define in dts)
  window.closeWindow = (browserWindow = getCurrentWindow()): void => {
    browserWindow.close()
  }

  // @ts-ignore (define in dts)
  window.selectGameDir = (): string | null => {
    const result = ipcRenderer.sendSync('select-dirs', {
      path: localStorage.getItem('gameDirectory')
    })
    console.log(result)
    if (result && !result.error) {
      return result.filePaths[0].replaceAll('\\', '/')
    }
    return null
  }

  // @ts-ignore (define in dts)
  window.getGameState = (): 'installed' | 'deprecated' | 'notInstalled' => {
    const result = ipcRenderer.sendSync('get-game-state', {
      path: localStorage.getItem('gameDirectory'),
      version: localStorage.getItem('gameVersion')
    })
    return result
  }

  // @ts-ignore (define in dts)
  window.cleanGameDirMods = (): Promise<void> => {
    return new Promise((resolve) => {
      ipcRenderer.once('cleaned-gamedir-mods', () => resolve())

      ipcRenderer.sendSync('clean-gamedir-mods', {
        basePath: localStorage.getItem('gameDirectory'),
        gameVersion: localStorage.getItem('gameVersion')
      })
    })
  }

  // @ts-ignore (define in dts)
  window.installServerMods = (): Promise<void> => {
    return new Promise((resolve) => {
      ipcRenderer.once('installed-server-mods', () => resolve())

      ipcRenderer.sendSync('install-server-mods', {
        basePath: localStorage.getItem('gameDirectory'),
        gameVersion: localStorage.getItem('gameVersion'),
        server: {
          name: localStorage.getItem('currServerName'),
          addr: localStorage.getItem('currServer')
        }
      })
    })
  }

  // @ts-ignore (define in dts)
  window.getGameInstalls = (): string[] => {
    const result = ipcRenderer.sendSync('get-game-installs', {
      path: localStorage.getItem('gameDirectory')
    })
    return result
  }

  // @ts-ignore (define in dts)
  window.installGame = (props: {
    setGameState: (state: 'installed' | 'deprecated' | 'notInstalled' | 'installing') => void
    setInstallData: (data: { progress: number; speed: number }) => void
  }): void => {
    ipcRenderer.sendSync('download-game', {
      path: localStorage.getItem('gameDirectory'),
      version: localStorage.getItem('gameVersion')
    })
    props.setGameState('installing')
    window.addEventListener('message', (evt) => {
      if (evt.data.type === 'download-progress') {
        props.setInstallData(evt.data.data)
      }
      if (evt.data.type === 'download-error') {
        props.setGameState('notInstalled')
      }
    })
  }

  // @ts-ignore (define in dts)
  window.launchGame = (props: {
    authkey?: string
    setGameState: (state: 'installed' | 'deprecated' | 'notInstalled' | 'running') => void
  }): void => {
    ipcRenderer.sendSync('launch-game', {
      path: localStorage.getItem('gameDirectory'),
      version: localStorage.getItem('gameVersion'),
      username: localStorage.getItem('username'),
      language: localStorage.getItem('language'),
      server: localStorage.getItem('currServer'),
      serverName: localStorage.getItem('currServerName'),
      serverType: localStorage.getItem('currServerType'),
      authkey: props.authkey ? props.authkey : undefined
    })
    props.setGameState('running')

    const listener = (evt): void => {
      switch (evt.data.type) {
        case 'game-closed':
          console.log('Game closed')
          props.setGameState('installed')
          // remove listener
          window.removeEventListener('message', listener)
          break
      }
    }

    window.addEventListener('message', listener)
  }

  // @ts-ignore (define in dts)
  window.startServer = (props): void => {
    ipcRenderer.sendSync('start-server', {
      path: localStorage.getItem('gameDirectory'),
      version: localStorage.getItem('gameVersion'),
      server: localStorage.getItem('currServer'),

      port: props.port,
      maxUsers: props.maxUsers,
      secret: props.secret,
      showTerminal: props.showTerminal
    })
    props.setServerState('starting')

    const listener = (evt): void => {
      switch (evt.data.type) {
        case 'server-closed':
          console.log('Server closed')
          props.setServerState('stopped')
          // remove listener
          window.removeEventListener('message', listener)
          break
        case 'server-ready':
          console.log('Server ready')
          props.setServerState('running')
          break
      }
    }

    window.addEventListener('message', listener)
  }

  // @ts-ignore (define in dts)
  window.stopServer = (props: {
    setServerState: (state: 'starting' | 'running' | 'stopped' | 'stopping') => void
  }): void => {
    props.setServerState('stopping')
    ipcRenderer.sendSync('stop-server', {
      path: localStorage.getItem('gameDirectory'),
      version: localStorage.getItem('gameVersion'),
      server: localStorage.getItem('currServer')
    })
  }

  // @ts-ignore (define in dts)
  window.cancelInstall = (): void => {
    ipcRenderer.send('cancel-download', {
      path: localStorage.getItem('gameDirectory'),
      version: localStorage.getItem('gameVersion')
    })
  }

  // @ts-ignore (define in dts)
  window.pauseInstall = (): void => {
    ipcRenderer.send('pause-download', {
      path: localStorage.getItem('gameDirectory'),
      version: localStorage.getItem('gameVersion')
    })
  }

  // @ts-ignore (define in dts)
  window.launchURL = (url: string): void => {
    ipcRenderer.send('launch-url', { url })
  }

  // @ts-ignore (define in dts)
  window.removeFiles = (files: string[]): void => {
    ipcRenderer.sendSync('remove-files', {
      files,
      path: localStorage.getItem('gameDirectory')
    })
  }
})
