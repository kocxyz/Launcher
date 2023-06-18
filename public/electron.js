const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron')
const remote = require('@electron/remote/main')
const https = require("https");
const fs = require('fs')
const path = require('path')
const url = require("url");
const unzipper = require("unzipper")
const { spawn, exec } = require('child_process');
const axios = require('axios')
const os = require('os')
const sudo = require('sudo-prompt');
const killProcess = require('tree-kill');
const pty = require('node-pty');
const discordRPC = require('discord-rpc');
const crypto = require('crypto')
remote.initialize()

try { 
  if(!fs.existsSync(path.join(os.tmpdir(), "kocitylauncherlogs"))) fs.mkdirSync(path.join(os.tmpdir(), "kocitylauncherlogs"))
  const logFileName = `log-${new Date().toLocaleDateString().replace(/\//g, "-")}.txt`
  const logFile = fs.createWriteStream(path.join(os.tmpdir(), "kocitylauncherlogs", logFileName), { flags: 'a' })
  console.log = function (d) { //
    logFile.write(`[${new Date().toLocaleString()}] ${d} \n`)
    process.stdout.write(`[${new Date().toLocaleString()}] ${d} \n`)
  }
}
catch(e) { console.log(e) }


const config = require(path.join(__dirname, 'config.json'))

let rpc = null
let rpcSettings = {}

const gotTheLock = app.requestSingleInstanceLock()

let mainWindow;

function createWindow () {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 1100,
        height: 550,
        frame: false,
        resizable: false,
        movable: true,
        icon: app.isPackaged ? undefined : 'public/icon.png',
        titleBarStyle: 'hidden',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: false
        }
    })

    mainWindow = win

    remote.enable(win.webContents)

    //load the index.html from a url
    if(app.isPackaged) win.loadFile(path.join(__dirname, "index.html"), { cwd: __dirname })
    else win.loadURL('http://localhost:3000');

    if(!app.isPackaged) win.webContents.openDevTools({
        mode: "detach",
        x: 0,
        y: 0,
    })

    // get the version from package.json and send it to the renderer
    win.webContents.on('did-finish-load', () => {
        win.webContents.executeJavaScript(`window.version = "${app.getVersion()}"`)
    });

    app.on("second-instance", (event, commandLine, workingDirectory) => {
      if (win.isMinimized()) win.restore()
      win.focus()
    })

    ipcMain.on('set-RPCstate', async (event, arg) => {
      event.returnValue = "ok"

      rpcSettings = arg

      if(arg.enabled) {
        if(rpc == null) await new Promise((resolve, reject) => {
          rpc = new discordRPC.Client({ transport: 'ipc' });
          rpc.login({ clientId: '1006272349999472720' }).catch(console.error);
          // log every event
          rpc.on('ready', () => {
            console.log('RPC ready');
            resolve()

            // rpc.subscribe('ACTIVITY_JOIN', ({ secret }) => {
            //   console.log('ACTIVITY_JOIN', secret);
            // });

            // rpc.subscribe('ACTIVITY_JOIN_REQUEST', ({ secret }) => {
            //   console.log('ACTIVITY_JOIN_REQUEST', secret);
            // });

            // rpc.subscribe('ACTIVITY_SPECTATE', ({ secret }) => {
            //   console.log('ACTIVITY_SPECTATE', secret);
            // });

            // rpc.subscribe('ACTIVITY_INVITE', ({ user, type }) => {
            //   console.log('ACTIVITY_INVITE', user, type);
            // });
          });
      })

        rpc.setActivity({
          state: "In Launcher",
          details: "Idle",
          largeImageKey: 'logo',
          largeImageText: 'Knockout City',
          instance: false,
        }).catch(console.error);
        

        
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
        console.log("Not canceled")

        let path = result.filePaths[0].replaceAll("\\", "/")

        if(result.filePaths[0].replaceAll("\\", "/") == arg.path) {
          console.log("Directory is identical")
          event.returnValue = null
          return dialog.showErrorBox("Error", "Selected directory is identical.")
        } 
        
        console.log(path.endsWith("/highRes"), path.endsWith("/lowRes"))

        if(path.endsWith("/highRes") || path.endsWith("/lowRes")) {
          console.log(path)
          path = path.split("/")
          path.pop()
          path = path.join("/")
          result.filePaths[0] = path
        }

        if(!fs.existsSync(arg.path)) {
          console.log("Doesn't exist")
          return event.returnValue = result
        }

        console.log("Reading previous dir")
        const files = fs.readdirSync(arg.path)

        if(files.length != 0) {
          console.log("Has files, checking content")
          let hasDownloadFiles = false;
          for(let file of files) {
            if(file.startsWith("files-") && file.endsWith(".zip")) hasDownloadFiles = true
            console.log(file)
          }

          if(files.includes("highRes") || files.includes("lowRes") || hasDownloadFiles) {
            console.log("Detected install traces")
            const action = await dialog.showMessageBox(win, {
              type: "warning",
              title: "Warning",
              message: "The previous directory contains traces of a KOcity installation. What do you want to do with the previous installation?",
              buttons: ["Keep", "Move", "Delete", "Cancel"]
            })
            console.log(action)
            switch(action.response) {
              case 0:
                // Keep
                event.returnValue = result
              break;
              case 1:
                // Move
                // Check for permissions
                try {
                  let res = await setUpPermission(result.filePaths[0])
                  console.log(res)
                } catch (error) {
                  console.log(error)
                  dialog.showErrorBox("Error", "Failed to set up permissions. Please try again.")
                  return event.returnValue = null
                }

                try {
                  await new Promise((resolve, reject) => {
                    for(let file of files) {
                      if(file.startsWith("files-") && file.endsWith(".zip") || file == "highRes" || file == "lowRes") {
                        fs.renameSync(`${arg.path}/${file}`, `${result.filePaths[0]}/${file}`)
                      }
                    }
                    resolve()
                  })
                } catch (error) {
                  console.error(error)
                  dialog.showErrorBox("Error", "Failed to copy files. " + error)
                  return event.returnValue = null
                }
                event.returnValue = result
              break;
              case 2:
                // Delete
                await new Promise((resolve, reject) => {
                  fs.rmSync(arg.path, { recursive: true })
                  resolve()
                })
                event.returnValue = result
              break;
              case 3:
                // Cancel
                event.returnValue = null
              break;
            }

          } else {
            console.log("Changed directory, no traces")
            event.returnValue = result
          }
        } else {
          console.log("Changed directory, no traces")
          event.returnValue = result
        }

      } else {
        console.log("Canceled")
        event.returnValue = null
        console.log("NotSent")
      }
    })

    ipcMain.on('get-game-state', async (event, arg) => {

      console.log(arg)

      const startFile = fs.existsSync(`${arg.path}/${arg.version == 1 ? 'highRes' : 'lowRes'}/KnockoutCity/KnockoutCity.exe`)
      const currentVersion = (await axios.get("https://cdn.ipgg.net/kocity/game/version")).data.trim()

      let installValid = false;
      if(fs.existsSync(`${arg.path}/${arg.version == 1 ? 'highRes' : 'lowRes'}/KnockoutCity`)) installValid = true;
      if(fs.existsSync(`${arg.path}/${arg.version == 1 ? 'highRes' : 'lowRes'}/eula.txt`)) installValid = true;

      if(installValid && !fs.existsSync(`${arg.path}/${arg.version == 1 ? 'highRes' : 'lowRes'}/version.txt`)) {
        const result = await dialog.showMessageBox(win, {
          type: "warning",
          title: "Installation faulty",
          message: "The used directory contains a valid installation. But the version.txt file is missing. Do you want to create one? (NOT RECOMMENDED)",
          buttons: ["Yes", "No"]
        })

        if(result.response === 0) fs.writeFileSync(`${arg.path}/${arg.version == 1 ? 'highRes' : 'lowRes'}/version.txt`, currentVersion)
      }

      const installedVersion = fs.existsSync(`${arg.path}/${arg.version == 1 ? 'highRes' : 'lowRes'}/version.txt`) ? fs.readFileSync(`${arg.path}/${arg.version == 1 ? 'highRes' : 'lowRes'}/version.txt`, 'utf8') : null

      if(startFile && currentVersion.trim() == installedVersion) return event.returnValue = "installed"
      else if(startFile && currentVersion != installedVersion) return event.returnValue = "deprecated"
      else return event.returnValue = "notInstalled"
    })

    ipcMain.on('download-game', async (event, arg) => {
      console.log("Starting download")
      console.log("Requesting version...")
      const version = (await axios.get("https://cdn.ipgg.net/kocity/game/version")).data
      console.log(`Version: ${version}`)

      let cancelled = false
      event.returnValue = "downloading"

      // Check write permissions
      if (!fs.existsSync(arg.path)) {
        // check if this process is allowed to write to the directory
        try {
          fs.mkdirSync(arg.path);
        } catch (error) {
          console.log(error.message);
          // Make the directory using sudoer and edit the permissions of the directory to allow everyone to write to it windows only
          await new Promise((resolve, reject) => {
            sudo.exec(`mkdir "${arg.path}" && icacls "${arg.path}" /grant "${os.userInfo().username}":(OI)(CI)F /T`, { name: 'Knockout City Launcher' }, (error, stdout, stderr) => {
              if (error)
                reject(new Error(error.message)), console.log(error);
              else {
                resolve();
              }
            });
          });
        }
      } else {
        // check if this process is allowed to write to the directory
        try {
          fs.writeFileSync(`${arg.path}/test.txt`, "test");
        } catch (error) {
          console.log(error.message);
          // Make the directory using sudoer and edit the permissions of the directory to allow everyone to write to it windows only
          await new Promise((resolve, reject) => {
            sudo.exec(`icacls "${arg.path}" /grant "${os.userInfo().username}":(OI)(CI)F /T`, { name: 'Knockout City Launcher' }, (error, stdout, stderr) => {
              if (error)
              reject(new Error(error.message)), console.log(error);
              else
                resolve();
            });
          });
        } finally {
          fs.existsSync(`${arg.path}/test.txt`) && fs.unlinkSync(`${arg.path}/test.txt`);
        }
      }

      // Parse the file size for resuming downloads
      let fileSize = 0;
      if (fs.existsSync(`${arg.path}/files-${arg.version}-${version}.zip`)) {
        const stats = fs.statSync(`${arg.path}/files-${arg.version}-${version}.zip`);
        fileSize = stats.size;
      }

      // Check if there are redundant files
      (() => {
        console.log("Checking for redundant files")

        if(fs.existsSync(`${arg.path}/files-1.zip`)) fs.rmSync(`${arg.path}/files-1.zip`)
        if(fs.existsSync(`${arg.path}/files-2.zip`)) fs.rmSync(`${arg.path}/files-2.zip`)

        const files = fs.readdirSync(arg.path)

        for (const file of files) {
          if(file.startsWith("files-")) {
            const fileVersion = file.match(/(\d+\.\d+-\d+)/)[1];
            console.log(fileVersion)
            if(fileVersion != version) {
              console.log(`Deleting redundant file ${file}`)
              fs.unlinkSync(`${arg.path}/${file}`)
            }
          }
        }
      })()

      let options = {
        headers: {
          "Range": `bytes=${fileSize}-`
        }
      }

      const downloadCallback = (res) => {
        const writeStream = fs.createWriteStream(`${arg.path}/files-${arg.version}-${version}.zip`, { flags: 'a' });
        if(fileSize > 0) console.log("Resuming download")

        res.pipe(writeStream);

        let lastPercentage = 0;

        res.on('data', (chunk) => {
          win.webContents.executeJavaScript(`window.postMessage({type: "download-progress", data: ${roundToDecimalPlace(((fileSize + writeStream.bytesWritten) / (parseFloat(res.headers['content-length']) + fileSize)) * 100, 2)}})`)
          win.setProgressBar((fileSize + writeStream.bytesWritten) / (parseFloat(res.headers['content-length']) + fileSize))
          
          lastPercentage = ((fileSize + writeStream.bytesWritten) / (parseFloat(res.headers['content-length']) + fileSize)) * 100
        });

        const updateRPCInterval = setInterval(() => {
          if(rpcSettings.enabled && !cancelled) {
            // Keep the percentage in this format: 00.00%
            rpc.setActivity({
              details: `Downloading the ${arg.version == 1 ? 'HighRes' : 'LowRes'} game files`,
              state: `${lastPercentage.toFixed(2)}%`,
              largeImageKey: 'logo',
              largeImageText: 'Knockout City'
            }).catch(console.error);
          }
        }, 2000)


        ipcMain.once('cancel-download', async (event, arg) => {
          if(cancelled) return
          console.log("Canceling download")
          cancelled = true
          res.destroy()
          writeStream.close()
          fs.rmSync(`${arg.path}/files-${arg.version}-${version}.zip`)

          if(updateRPCInterval && rpcSettings.enabled) clearInterval(updateRPCInterval)
          if(rpcSettings.enabled)  rpc.setActivity({
            state: "In Launcher",
            details: "Idle",
            largeImageKey: 'logo',
            largeImageText: 'Knockout City',
            instance: false,
          }).catch(console.error);
            

          win.setProgressBar(-1)
        })

        ipcMain.once('pause-download', async (event, arg) => {
          if(cancelled) return
          console.log("Pausing download")
          cancelled = true
          res.destroy()

          if(updateRPCInterval && rpcSettings.enabled) clearInterval(updateRPCInterval)
          if(rpcSettings.enabled)  rpc.setActivity({
            state: "In Launcher",
            details: "Idle",
            largeImageKey: 'logo',
            largeImageText: 'Knockout City',
            instance: false,
          }).catch(console.error);

          writeStream.close()
          win.setProgressBar(-1)
        })

        win.once('close', () => {
          console.log("Canceling download due to window close")
          if(cancelled) return
          cancelled = true
          res.destroy()

          if(updateRPCInterval && rpcSettings.enabled) clearInterval(updateRPCInterval)
          if(rpcSettings.enabled)  rpc.setActivity({
            state: "In Launcher",
            details: "Idle",
            largeImageKey: 'logo',
            largeImageText: 'Knockout City',
            instance: false,
          }).catch(console.error);

          writeStream.close()
        })

        writeStream.on('finish', () => {
          if(cancelled) return
          writeStream.close();

          if(updateRPCInterval && rpcSettings.enabled) clearInterval(updateRPCInterval)

          if(rpcSettings.enabled) rpc.setActivity({
            details: `Downloading the ${arg.version == 1 ? 'HighRes' : 'LowRes'} game files`,
            state: `Unpacking`,
            largeImageKey: 'logo',
            largeImageText: 'Knockout City'
          }).catch(console.error);

          win.setProgressBar(-1)
          win.webContents.executeJavaScript(`window.postMessage({type: "download-progress", data: 100})`)
          console.log("Downloaded");
          // unzip the file
          try {
            win.setProgressBar(5)
            if(fs.existsSync(`${arg.path}/${arg.version == 1 ? 'highRes' : 'lowRes'}`)) fs.rmdirSync(`${arg.path}/${arg.version == 1 ? 'highRes' : 'lowRes'}`, { recursive: true })
            fs.mkdirSync(`${arg.path}/${arg.version == 1 ? 'highRes' : 'lowRes'}`)

            fs.createReadStream(`${arg.path}/files-${arg.version}-${version}.zip`)
            .pipe(unzipper.Extract({ path: `${arg.path}/${arg.version == 1 ? 'highRes' : 'lowRes'}` }))
            .on("finish", () => {
              console.log("Files unzipped successfully");
              fs.writeFileSync(`${arg.path}/${arg.version == 1 ? 'highRes' : 'lowRes'}/version.txt`, version)
              fs.rmSync(`${arg.path}/files-${arg.version}-${version}.zip`)
              win.reload()

              if(rpcSettings.enabled) rpc.setActivity({
                state: "In Launcher",
                details: "Idle",
                largeImageKey: 'logo',
                largeImageText: 'Knockout City',
                instance: false,
              }).catch(console.error);

              win.setProgressBar(-1)
            });
          } catch (err) {
            console.log(err)
            win.setProgressBar(-1)
            dialog.showMessageBox(win, {
              type: "error",
              title: "Unexpected Error",
              message: "An error occurred while unzipping the files. Error: " + err.message
            })
          }
        });
      }

      const mirrors = (await axios.get("https://cdn.ipgg.net/kocity/game/mirror")).data

      https.get(arg.version == 1 ? mirrors.highRes : mirrors.lowRes, fileSize > 0 ? options : downloadCallback, downloadCallback)

      
    })


    ipcMain.on('launch-game', async (event, arg) => {
      console.log("Launching game")     

      console.log(arg)

      const args = [`-lang=${arg.language || 'en'}`, `-username=${arg.authkey ? arg.authkey : arg.username}`, `-backend=${arg.server}`];
      const game = spawn(`${arg.path}/${arg.version == 1 ? 'highRes' : 'lowRes'}/KnockoutCity/KnockoutCity.exe`, args, { 
        cwd: `${arg.path}/${arg.version == 1 ? 'highRes' : 'lowRes'}/KnockoutCity`,
        detached: true,
        stdio: 'ignore',
        env: {}
      })
      console.log(game.spawnargs)
      event.returnValue = "launched"
      game.on('error', (err) => {
        console.log(err)
        dialog.showMessageBox(win, {
          type: "error",
          title: "Unexpected Error",
          message: "An error occurred while launching the game. Error: " + err.message
        })
      })

      game.once('spawn', () => {
        console.log("Game launched")

        // rpcSettings.partyId = arg.serverName + crypto.randomBytes(16).toString("hex")
        // rpcSettings.joinSecret = arg.serverName + "secret"
        // rpcSettings.partySize = 1
        // rpcSettings.partyMax = 16

        if(rpcSettings.enabled) rpc.setActivity({
          details: `Playing on a ${arg.serverType} server`,
          state: rpcSettings.displayName ? `Server: ${arg.serverName}` : undefined,
          startTimestamp: Date.now(),
          largeImageKey: "logo",
          largeImageText: gimmeEmoji().repeat(5),
          instance: true,

          // partyId: rpcSettings.partyId,
          // partySize: rpcSettings.partySize,
          // partyMax: rpcSettings.partyMax,
          // joinSecret: rpcSettings.joinSecret,
        }).catch(console.error);
      })

      game.once('close', (code, message) => {
        console.log(`Game process exited with code ${code} and message ${message}`);
        win.webContents.executeJavaScript(`window.postMessage({type: "game-closed"})`)

        if(code != 0) dialog.showMessageBox(win, {
          type: "error",
          title: "Game Crashed",
          message: "The game crashed with code " + code
        })

        if(rpcSettings.enabled) rpc.setActivity({
          state: "In Launcher",
          details: "Idle",
          largeImageKey: 'logo',
          largeImageText: 'Knockout City',
          instance: false,
        }).catch(console.error);
      });
    })



    ipcMain.on("start-server", async (event, arg) => {
      console.log(arg)
      console.log("Starting server")

      let args = [];
      if(arg.port != 0) args.push(`-backend_port=${arg.port}`)
      if(arg.maxUsers && arg.maxUsers != 0) args.push(`-backend_tunable_user_connections_max_per_backend=${arg.maxUsers}`)
      if(arg.secret.trim() != "") args.push(`-secret=${arg.secret}`)

      const server = spawn(`${arg.path}/${arg.version == 1 ? 'highRes' : 'lowRes'}/KnockoutCityServer/KnockoutCityServer.exe`, args, {
        cwd: `${arg.path}/${arg.version == 1 ? 'highRes' : 'lowRes'}/KnockoutCityServer`
      })

      let cmd;
      if(arg.showTerminal) {

        let winPosX = win.getPosition()[0] + win.getSize()[0] + 10
        let winPosY = win.getPosition()[1]

        // check if terminal window will spawn off screen, if so, spawn it above the main window, when that also doesn't work, spawn it in the middle of the screen
        if(winPosX + 1100 > screen.getPrimaryDisplay().workAreaSize.width) {
          winPosX = win.getPosition()[0] - 1100 - 10
          if(winPosX < 0) {
            winPosX = (screen.getPrimaryDisplay().workAreaSize.width / 2) - 550
            winPosY = (screen.getPrimaryDisplay().workAreaSize.height / 2) - 275
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
            contextIsolation: false,
          }
        })
        cmd.loadFile(path.join(__dirname, "shell.html"), { cwd: __dirname })
      }


      server.stdout.on('data', (data) => {
        if(data.includes("private_server: Ready to brawl")) win.webContents.executeJavaScript(`window.postMessage({type: "server-ready"})`)
        data = data.toString().replace(/[^a-zA-Z0-9:_+#\/.\ ]/g, '')
        if(cmd && !cmd.isDestroyed()) cmd.webContents.executeJavaScript(`window.shell.print("${data}").catch((err) => {})`).catch((err) => {})
      });

      server.stderr.on('data', (data) => {
        if(cmd && !cmd.isDestroyed()) cmd.webContents.executeJavaScript(`window.shell.print("${data}").catch((err) => {})`).catch((err) => {})
      });

      console.log(server.spawnargs)
      event.returnValue = "launched"
      server.on('error', (err) => {
        console.log(err)
        dialog.showMessageBox(win, {
          type: "error",
          title: "Unexpected Error",
          message: "An error occurred while launching the server. Error: " + err.message
        })
      })

      server.once('close', (code) => {
        console.log(`Server process exited with code ${code}`);
        // remove all event listeners
        server.removeAllListeners()
        win.webContents.executeJavaScript(`window.postMessage({type: "server-closed"})`)
      });

      ipcMain.once("stop-server", async (event, arg) => {
        event.returnValue = "stopping"
        console.log("Stopping server")
        if(cmd && !cmd.isDestroyed()) cmd.close()
        setTimeout(() => {
          killProcess(server.pid, "SIGINT")
        }, 1000)
      })
    })

    ipcMain.on("launch-url", async (event, arg) => {
      console.log("Launching URL")
      event.returnValue = "launched"
      exec(`start ${arg.url}`)
    })
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
if(gotTheLock) {
  app.whenReady().then(() => {
    // check whether the app is already running and if so, focus it and then quit this window
    if(!app.requestSingleInstanceLock()) {
      const win = BrowserWindow.getAllWindows()[0]
      if(win) {
        win.focus()
        win.show()
      }
      app.quit()
    }
  
    axios.get("http://cdn.ipgg.net/kocity/version").then(async (res) => {
      console.log("Checking for update")
      // get the version of the app from electron
      let version = app.getVersion().trim()
      console.log(`${version} => ${res.data}`)
      if(`${res.data}`.trim() == `${version}`.trim()) {
        createWindow()
      } else {
        const { response } = await dialog.showMessageBox({
          type: "info",
          title: "Update Available",
          message: `An update is available for the Knockout City Launcher! Would you like to download it?`,
          buttons: ["Yes", "No"]
        })
        if(response === 0) {
          // open a small update window
          const updateWindow = new BrowserWindow({
            width: 400,
            height: 200,
            frame: false,
            resizable: false,
            icon: "./www/logo.png",
            webPreferences: {
              nodeIntegration: true
            }
          })
          console.log("Update window opened!")
          updateWindow.loadFile(path.join(__dirname, "update.html"), { cwd: __dirname })
  
          // download the exe file using axios
          console.log("Downloading update...")
          axios.get("http://cdn.ipgg.net/kocity/kocitylauncher.exe", {
            responseType: 'arraybuffer'
          }).then(async (res) => {
            console.log("Update complete!")
  
  
            // write it to the download folder
            fs.writeFileSync(`C:/Users/${os.userInfo().username}/AppData/Local/Temp/kocity-update.exe`, res.data)
  
            // open the file
            spawn(`C:/Users/${os.userInfo().username}/AppData/Local/Temp/kocity-update.exe`, { detached: true, stdio: 'ignore' })
            
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
    if(rpc && rpcSettings.enabled) {
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

async function setUpPermission(path) {
  // check if this process is allowed to write to the directory
  try {
    fs.writeFileSync(path + "/test.txt", "test")
    console.log(`Writable ${fs.existsSync(path + "/test.txt")}`)
    console.log("Has permissions")
  } catch (error) {
    console.log(error.message);
    // Make the directory using sudoer and edit the permissions of the directory to allow everyone to write to it windows only
    await new Promise((resolve, reject) => {
      sudo.exec(`icacls "${path}" /grant "${os.userInfo().username}":(OI)(CI)F /T`, { name: 'Knockout City Launcher' }, (error, stdout, stderr) => {
        if (error) reject("Could not raise permissions"), console.log(error);
        else resolve();
      });
    }).catch((err) => {
      return Promise.reject(err);
    });
  } finally {
    if(fs.existsSync(path + "/test.txt")) fs.rmSync(path + "/test.txt")
    return Promise.resolve();
  }
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Function that rounds a number to a certain number of decimal places
function roundToDecimalPlace(number, decimalPlaces) {
  return Math.round(number * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
}

process.on('uncaughtException', function (err) {
  dialog.showMessageBox(mainWindow, {
    type: "error",
    title: "Unexpected Error",
    message: "An unexpected error occurred. Error: " + err.message
  })
  console.log(err);
});

process.on('unhandledRejection', function (err) {
  dialog.showMessageBox(mainWindow, {
    type: "error",
    title: "Unexpected Error",
    message: "An unexpected error occurred. Error: " + err.message
  })
  console.log(err);
});

function gimmeEmoji() {
  let i = Math.floor(Math.random() * 10)

  let emojis = [
    "💀",
    "💯",
    "🤓",
    "🎈",
    "🗿",
    "👋",
    "🏀",
    "🎖️",
    "🎉",
    "🎊"
  ];

  return emojis[i]
}
