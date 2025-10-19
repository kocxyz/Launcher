import { ipcRenderer } from 'electron'
import { getCurrentWindow } from '@electron/remote'
import { BrowserWindow } from 'electron'
import * as Sentry from "@sentry/electron/preload";
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
    os.platform() === 'win32'
      ? 'C:/Program Files (x86)/Steam/steamapps/common/Knockout City - Private Server Edition'
      : `${os.homedir()}/.local/share/Steam/steamapps/common/Knockout City - Private Server Edition`
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
  window.patchGameClient = (): Promise<void> => {
    return new Promise((resolve) => {
      ipcRenderer.once('patched-game-client', () => resolve())

      ipcRenderer.sendSync('patch-game-client', {
        basePath: localStorage.getItem('gameDirectory'),
        serverType: localStorage.getItem('currServerType') || 'private'
      })
    })
  }

  // @ts-ignore (define in dts)
  window.installGame = (): void => {
    ipcRenderer.sendSync('download-game')
  }

  // @ts-ignore (define in dts)
  window.uninstallGame = (): void => {
    ipcRenderer.sendSync('uninstall-game')
  }

  // @ts-ignore (define in dts)
  window.launchGame = (props: {
    authkey?: string
    setGameState: (state: 'installed' | 'deprecated' | 'notInstalled' | 'running') => void
  }): void => {
    ipcRenderer.sendSync('launch-game', {
      path: localStorage.getItem('gameDirectory'),
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
  window.launchURL = (url: string): void => {
    console.log('launch url', url)
    ipcRenderer.send('launch-url', { url })
  }
})