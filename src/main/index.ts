import { app, BrowserWindow, ipcMain, dialog, screen, shell } from 'electron'
import remote from '@electron/remote/main'
import fs from 'fs'
import fse from 'fs-extra'
import path from 'path'
import { spawn, exec } from 'child_process'
import axios from 'axios'
import os from 'os'
import killProcess from 'tree-kill'
import discordRPC from 'discord-rpc'
import { is } from '@electron-toolkit/utils'

remote.initialize()

try {
  if (!fs.existsSync(path.join(os.tmpdir(), 'kocitylauncherlogs')))
    fs.mkdirSync(path.join(os.tmpdir(), 'kocitylauncherlogs'))
  const logFileName = `log-${new Date().toLocaleDateString().replace(/\//g, '-')}.txt`
  const logFile = fs.createWriteStream(path.join(os.tmpdir(), 'kocitylauncherlogs', logFileName), {
    flags: 'a'
  })
  console.log = function (d: string): void {
    //
    logFile.write(
      `[${new Date().toLocaleString()}] ${
        typeof d === 'string' ? d : JSON.stringify(d, null, 2)
      } \n`
    )
    process.stdout.write(
      `[${new Date().toLocaleString()}] ${
        typeof d === 'string' ? d : JSON.stringify(d, null, 2)
      } \n`
    )
  }
} catch (e) {
  console.log(e)
}

let rpc: discordRPC.Client | undefined
let rpcSettings: {
  enabled: boolean
  partyId?: string
  joinSecret?: string
  partySize?: number
  partyMax?: number
  displayName?: boolean
  allowJoining?: boolean
} = {
  enabled: false
}

interface Server {
  id: number
  status: 'online' | 'offline'
  name: string
  ip: string
  region: string
  players: number
  maxPlayers: number
}

let serverList: Server[] = []

const gotTheLock = app.requestSingleInstanceLock()

const discordRPCS = {
  idle: {
    state: 'In Launcher',
    details: 'Idle',
    largeImageKey: 'logo',
    largeImageText: `v${app.getVersion()}${app.isPackaged ? '' : '-dev'}`,
    instance: false
  }
}

let mainWindow: BrowserWindow | undefined

function createWindow(): void {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1100,
    height: 550,
    frame: false,
    resizable: false,
    movable: true,
    icon: is.dev
      ? path.join(__dirname, '../../resources/icon.png')
      : path.join(__dirname, '../resources/icon.png'),
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false
    }
  })

  mainWindow = win

  remote.enable(win.webContents)

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (!app.isPackaged)
    win.webContents.openDevTools({
      mode: 'detach'
    })

  async function updateServerList(): Promise<void> {
    try {
      serverList = [
        ...(process.env.NODE_ENV === 'development'
          ? ([
              {
                id: -1,
                name: 'Localhost',
                ip: '127.0.0.1:23600',
                maxPlayers: 10,
                players: 0,
                region: 'LOCAL',
                status: 'online'
              }
            ] satisfies Server[])
          : []),
        ...(
          await axios.get(`https://api.kocity.xyz/stats/servers`, {
            timeout: 5000
          })
        ).data
      ]
    } catch (error) {
      console.log(error)
    }
  }
  setInterval(updateServerList, 1000 * 60 * 3)
  updateServerList()

  // get the version from package.json and send it to the renderer
  win.webContents.on('did-finish-load', () => {
    win.webContents.executeJavaScript(`window.version = "${app.getVersion()}"`)
  })

  app.on('second-instance', () => {
    if (win.isMinimized()) win.restore()
    win.focus()
  })

  ipcMain.on(
    'patch-game-client',
    async (event, args: { basePath: string; serverType: 'public' | 'private' }) => {
      event.returnValue = undefined

      const gameDirPath = path.join(args.basePath, 'KnockoutCity')

      const gameExePath = path.join(gameDirPath, 'KnockoutCity.exe')
      const backupGameExePath = path.join(gameDirPath, 'KnockoutCity.exe.bak')

      if (!fse.existsSync(backupGameExePath)) {
        console.log(`Backing up ${gameExePath} to ${backupGameExePath}`)
        await fse.copy(gameExePath, backupGameExePath)
      }

      let data = await fse.readFile(gameExePath).catch((error) => {
        console.error('Failed to read Game File:', error)
        throw Error('Failed to read Game File')
      })

      const patches: {
        name: string
        startAddress: number
        endAddress: number
        replacement: () => Buffer
      }[] = [
        {
          name: 'Signature Verification',
          startAddress: 0x3cad481,
          endAddress: 0x3cad485,
          replacement: () => Buffer.from([0xb8, 0x01, 0x00, 0x00])
        },
        {
          name: 'Auth Provider',
          startAddress: 0x4f97230,
          endAddress: 0x4f97233,
          replacement: () =>
            Buffer.from(args.serverType === 'private' ? [0x64, 0x65, 0x76] : [0x78, 0x79, 0x7a])
        }
      ]

      let needsPatching = false
      for (const patch of patches) {
        console.log(`Checking ${patch.name}...`)
        const startBuffer = data.subarray(0, patch.startAddress)
        const existingBytes = data.subarray(patch.startAddress, patch.endAddress)
        const endBuffer = data.subarray(patch.endAddress)

        if (!existingBytes.equals(patch.replacement())) {
          needsPatching = true

          console.log(`Patching ${patch.name}...`)
          data = Buffer.concat([startBuffer, patch.replacement(), endBuffer])
        }
      }

      if (needsPatching) {
        console.log('Writing patched Game File...')
        await fse.writeFile(gameExePath, data).catch((error) => {
          console.error('Failed to write patched Game File:', error)
          throw Error('Failed to write patched Game File')
        })
      }

      event.sender.send('patched-game-client')
    }
  )

  ipcMain.on('set-RPCstate', async (event, arg) => {
    event.returnValue = 'ok'

    rpcSettings = arg

    if (arg.enabled) {
      if (rpc == null)
        await new Promise((resolve) => {
          rpc = new discordRPC.Client({ transport: 'ipc' })
          rpc.login({ clientId: '1006272349999472720' }).catch(console.error)
          // log every event
          rpc.on('ready', () => {
            console.log('RPC ready')

            rpc.on('ACTIVITY_JOIN', (data) => {
              console.log(data)
              const server = data.secret.split('//')[0]
              const serverName = data.secret.split('//')[1]
              const serverType = data.secret.split('//')[2]
              win.webContents.executeJavaScript(`localStorage.setItem("currServer", "${server}")`)
              win.webContents.executeJavaScript(
                `localStorage.setItem("currServerName", "${serverName}")`
              )
              win.webContents.executeJavaScript(
                `localStorage.setItem("currServerType", "${serverType}")`
              )

              setTimeout(() => {}, 100)
            })

            rpc.subscribe('ACTIVITY_JOIN', ({ secret }) => {
              console.log('ACTIVITY_JOIN', secret)
            })
            resolve(null)
          })
        })

      rpc.setActivity(discordRPCS.idle).catch(console.error)
    } else if (!arg.enabled && rpc != null) {
      rpc.destroy()
      rpc = null
    }
  })

  ipcMain.on('select-dirs', async (event, arg) => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    })
    console.log(result)
    if (!result.canceled) {
      console.log('Not canceled')

      if (result.filePaths[0].replaceAll('\\', '/') == arg.path) {
        console.log('Directory is identical')
        event.returnValue = null
        return dialog.showErrorBox('Error', 'Selected directory is identical.')
      }

      if (!fs.existsSync(arg.path)) {
        console.log("Doesn't exist")
        return (event.returnValue = result)
      }

      event.returnValue = result
    } else {
      console.log('Canceled')
      event.returnValue = null
      console.log('NotSent')
    }
  })

  ipcMain.on('get-game-state', async (event, arg) => {
    console.log(arg)

    const startFile = fs.existsSync(`${arg.path}/KnockoutCity/KnockoutCity.exe`)
    let installValid = false
    if (fs.existsSync(`${arg.path}/KnockoutCity`)) installValid = true
    if (fs.existsSync(`${arg.path}/eula.txt`)) installValid = true

    if (startFile && installValid) return (event.returnValue = 'installed')
    else return (event.returnValue = 'notInstalled')
  })

  ipcMain.on('download-game', async (event) => {
    shell.openExternal('steam://install/2915930')
    event.returnValue = undefined
  })

  ipcMain.on('uninstall-game', async (event) => {
    shell.openExternal('steam://uninstall/2915930')
    event.returnValue = undefined
  })

  ipcMain.on('launch-game', async (event, arg) => {
    console.log('Launching game')

    let accToken: string | undefined

    let statusUpdateInterval
    const playtimeInterval = setInterval(() => {
      if (!accToken) return
      axios
        .post(
          `https://api.kocity.xyz/stats/user/username/${arg.username}/playtime`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accToken}`
            }
          }
        )
        .then(() => {})
        .catch(() => {})
    }, 1000 * 60)
    const startTime = Date.now()

    console.log(arg)

    const args = [
      `-lang=${arg.language || 'en'}`,
      `-username=${arg.authkey ? arg.authkey : arg.username}`,
      `-backend=${arg.server}`
    ]
    const game =
      os.platform() === 'linux'
        ? exec(`wine KnockoutCity.exe ${args.join(' ')}`, {
            cwd: `${arg.path}/KnockoutCity`,
            uid: os.userInfo().uid,
            gid: os.userInfo().gid,
            shell: '/bin/bash'
          })
        : spawn(`KnockoutCity.exe`, args, {
            detached: true,
            stdio: 'ignore',
            cwd: `${arg.path}/KnockoutCity`,
            env: {}
          })

    event.returnValue = 'launched'
    game.on('error', (err) => {
      console.log(err)
      dialog.showMessageBox(win, {
        type: 'error',
        title: 'Unexpected Error',
        message: 'An error occurred while launching the game. Error: ' + err.message
      })
    })

    game.once('spawn', async () => {
      console.log('Game launched')

      accToken = await win.webContents.executeJavaScript(`localStorage.getItem("authToken")`)

      rpcSettings.partyId = `${arg.server}`
      rpcSettings.joinSecret = `${arg.server}//${arg.serverName}//${arg.serverType}`
      const server = serverList.find((server) => server.ip == arg.server)
      if (server) {
        rpcSettings.partySize = arg.serverType == 'public' ? server.players + 1 : 1
        rpcSettings.partyMax = arg.serverType == 'public' ? server.maxPlayers : 8
      }

      if (rpcSettings.enabled)
        rpc
          .setActivity({
            details: `Playing on a ${arg.serverType} server`,
            state: rpcSettings.displayName ? `Server: ${arg.serverName}` : undefined,
            startTimestamp: startTime,
            largeImageKey: 'logo',
            largeImageText: gimmeEmoji(),
            instance: true,

            partyId: rpcSettings.allowJoining ? rpcSettings.partyId : undefined,
            partySize: rpcSettings.allowJoining ? rpcSettings.partySize : undefined,
            partyMax: rpcSettings.allowJoining ? rpcSettings.partyMax : undefined,
            joinSecret: rpcSettings.allowJoining ? rpcSettings.joinSecret : undefined
          })
          .catch(console.error)

      if (arg.serverType == 'public' && rpcSettings.allowJoining && rpcSettings.enabled) {
        statusUpdateInterval = setInterval(() => {
          const server = serverList.find((server) => server.ip == arg.server)
          if (server) {
            rpcSettings.partySize = Math.max(server.players, 1)
            rpcSettings.partyMax = server.maxPlayers
          }

          rpc
            .setActivity({
              details: `Playing on a ${arg.serverType} server`,
              state: rpcSettings.displayName ? `Server: ${arg.serverName}` : undefined,
              startTimestamp: startTime,
              largeImageKey: 'logo',
              largeImageText: gimmeEmoji(),
              instance: true,

              partyId: rpcSettings.partyId,
              partySize: rpcSettings.partySize,
              partyMax: rpcSettings.partyMax,
              joinSecret: rpcSettings.joinSecret
            })
            .catch(console.error)
        }, 15000)
      }
    })

    game.once('close', (code, message) => {
      console.log(`Game process exited with code ${code} and message ${message}`)
      win.webContents.executeJavaScript(`window.postMessage({type: "game-closed"})`)

      if (code != 0)
        dialog.showMessageBox(win, {
          type: 'error',
          title: 'Game Crashed',
          message: 'The game crashed with code ' + code
        })

      clearInterval(playtimeInterval)
      if (statusUpdateInterval) clearInterval(statusUpdateInterval)

      if (rpcSettings.enabled) rpc.setActivity(discordRPCS.idle).catch(console.error)
    })
  })

  ipcMain.on('start-server', async (event, arg) => {
    console.log(arg)
    console.log('Starting server')

    if (os.platform() === 'linux') {
      win.webContents.executeJavaScript(`window.postMessage({type: "server-closed"})`)
      event.returnValue = 'stopping'
      return dialog.showErrorBox('Error', 'Hosting a server is currently not supported on Linux.')
    }

    const args: string[] = []
    if (arg.port != 0) args.push(`-backend_port=${arg.port}`)
    if (arg.maxUsers && arg.maxUsers != 0)
      args.push(`-backend_tunable_user_connections_max_per_backend=${arg.maxUsers}`)
    if (arg.secret.trim() != '') args.push(`-secret=${arg.secret}`)

    const server = spawn(
      `${os.platform() === 'linux' ? 'wine ' : ''}KnockoutCityServer.exe`,
      args,
      {
        cwd: `${arg.path}/KnockoutCityServer`
      }
    )

    let cmd
    if (arg.showTerminal) {
      let winPosX = win.getPosition()[0] + win.getSize()[0] + 10
      let winPosY = win.getPosition()[1]

      // check if terminal window will spawn off screen, if so, spawn it above the main window, when that also doesn't work, spawn it in the middle of the screen
      if (winPosX + 1100 > screen.getPrimaryDisplay().workAreaSize.width) {
        winPosX = win.getPosition()[0] - 1100 - 10
        if (winPosX < 0) {
          winPosX = screen.getPrimaryDisplay().workAreaSize.width / 2 - 550
          winPosY = screen.getPrimaryDisplay().workAreaSize.height / 2 - 275
        }
      }

      cmd = new BrowserWindow({
        width: 1100,
        height: 550,
        // spawn left next to main window
        x: winPosX,
        y: winPosY,
        autoHideMenuBar: true,
        webPreferences: {
          webSecurity: false,
          nodeIntegration: true,
          contextIsolation: false
        }
      })
      if (is.dev && process.env['ELECTRON_RENDERER_URL'])
        cmd.loadFile(path.join(process.env['ELECTRON_RENDERER_URL'], '../../resources/shell.html'))
      else cmd.loadFile(path.join(__dirname, '../../resources/shell.html'))
    }

    server.stdout.on('data', (data) => {
      if (data.includes('private_server: Ready to brawl'))
        win.webContents.executeJavaScript(`window.postMessage({type: "server-ready"})`)
      data = data.toString().replace(/[^a-zA-Z0-9:_+#/. ]/g, '')
      if (cmd && !cmd.isDestroyed())
        cmd.webContents
          .executeJavaScript(`window.shell.print("${data}").catch((err) => {})`)
          .catch(() => {})
    })

    server.stderr.on('data', (data) => {
      if (cmd && !cmd.isDestroyed())
        cmd.webContents
          .executeJavaScript(`window.shell.print("${data}").catch((err) => {})`)
          .catch(() => {})
    })

    console.log(server.spawnargs)
    event.returnValue = 'launched'
    server.on('error', (err) => {
      console.log(err)
      dialog.showMessageBox(win, {
        type: 'error',
        title: 'Unexpected Error',
        message: 'An error occurred while launching the server. Error: ' + err.message
      })
    })

    server.once('close', (code) => {
      console.log(`Server process exited with code ${code}`)
      // remove all event listeners
      server.removeAllListeners()
      win.webContents.executeJavaScript(`window.postMessage({type: "server-closed"})`)
    })

    ipcMain.once('stop-server', async (event) => {
      event.returnValue = 'stopping'
      console.log('Stopping server')
      if (cmd && !cmd.isDestroyed()) cmd.close()
      setTimeout(() => {
        if (server?.pid) killProcess(server.pid, 'SIGINT')
      }, 1000)
    })
  })

  ipcMain.on('launch-url', async (event, arg) => {
    arg.url = typeof arg.url == 'string' ? arg.url : arg.url.toString()
    console.log('Launching URL: ' + arg.url)
    event.returnValue = 'launched'
    exec(`${os.platform() === 'linux' ? 'xdg-open' : 'start'} ${arg.url}`)
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
if (gotTheLock) {
  app.whenReady().then(() => {
    // check whether the app is already running and if so, focus it and then quit this window
    if (!app.requestSingleInstanceLock()) {
      const win = BrowserWindow.getAllWindows()[0]
      if (win) {
        win.focus()
        win.show()
      }
      app.quit()
    }

    axios
      .get('https://cdn.ipgg.net/kocity/version', {
        timeout: 5000
      })
      .then(async (res) => {
        console.log('Checking for update')
        // get the version of the app from electron
        const version = app.getVersion().trim()
        console.log(`${version} => ${res.data}`)
        if (`${res.data}`.trim() == `${version}`.trim()) {
          createWindow()
        } else {
          if (!(os.platform() === 'win32')) {
            dialog.showErrorBox(
              'Update Available',
              'There is an update available but auto updating is currently only supported on Windows. Please download the latest version from https://kocity.xyz'
            )
            createWindow()
            return
          }
          const { response } = await dialog.showMessageBox({
            type: 'info',
            title: 'Update Available',
            message: `An update is available for the Knockout City Launcher! Would you like to download it?`,
            buttons: ['Yes', 'No']
          })
          if (response === 0) {
            // open a small update window
            const updateWindow = new BrowserWindow({
              width: 500,
              height: 250,
              frame: false,
              resizable: false,
              icon: './www/logo.png',
              webPreferences: {
                nodeIntegration: true
              }
            })
            console.log('Update window opened!')

            if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
              updateWindow.loadFile(
                path.join(process.env['ELECTRON_RENDERER_URL'], '../../resources/update.html')
              )
            } else {
              updateWindow.loadFile(path.join(__dirname, '../../resources/update.html'))
            }

            // download the exe file using axios
            console.log('Downloading update...')
            axios
              .get('https://cdn.ipgg.net/kocity/kocitylauncher.exe', {
                responseType: 'arraybuffer'
              })
              .then(async (res) => {
                console.log('Update complete!')

                // write it to the download folder
                fs.writeFileSync(`${os.tmpdir()}/kocity-update.exe`, res.data)

                // open the file
                spawn(`${os.tmpdir()}/kocity-update.exe`, { detached: true, stdio: 'ignore' })

                setTimeout(() => {
                  app.quit()
                  process.exit(0)
                }, 1000)
              })
          } else {
            createWindow()
          }
        }
      })
  })
} else {
  app.quit()
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (rpc && rpcSettings.enabled) {
      rpc.destroy()
    }
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.

  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

process.on('uncaughtException', function (err) {
  if (mainWindow)
    dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: 'Unexpected Error',
      message: 'An unexpected error occurred. Error: ' + err.message
    })
  console.log(err)
})

process.on('unhandledRejection', function (err: PromiseRejectionEvent) {
  if (mainWindow)
    dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: 'Unexpected Error',
      message: 'An unexpected error occurred. Promise Rejection: ' + err.reason
    })
  console.log(JSON.stringify(err, null, 2))
})

function gimmeEmoji(): string {
  const emojis = ['💀', '💯', '🤓', '🎈', '🗿', '👋', '🏀', '🎖️', '🎉', '🎊']

  let finalString = ''

  for (let i = 0; i < 5; i++) {
    const i = Math.floor(Math.random() * 10)

    finalString += emojis[i]
  }

  return finalString
}
