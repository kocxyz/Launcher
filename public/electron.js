const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const remote = require('@electron/remote/main')
const https = require("https");
const fs = require('fs')
const path = require('path')
const url = require("url");
const unzipper = require("unzipper")
const { spawn, exec } = require('child_process');
const axios = require('axios')
const os = require('os')
remote.initialize()

function createWindow () {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 1100,
        height: 550,
        frame: false,
        resizable: false,
        movable: true,
        titleBarStyle: 'hidden',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: __dirname + '/preload.js',
            webSecurity: false
        }
    })

    remote.enable(win.webContents)

    //load the index.html from a url
    if(app.isPackaged) win.loadFile(path.join(__dirname, "index.html"), { cwd: __dirname })
    else win.loadURL('http://localhost:3000');

    if(!app.isPackaged) win.webContents.openDevTools()

    // get the version from package.json and send it to the renderer
    win.webContents.on('did-finish-load', () => {
        win.webContents.executeJavaScript(`window.version = "${app.getVersion()}"`)
    });


    ipcMain.on('select-dirs', async (event, arg) => {
      const result = await dialog.showOpenDialog(win, {
        properties: ['openDirectory']
      })
      if (!result.canceled) {
        // write it to localStorage
        // win.webContents.executeJavaScript(`localStorage.setItem("gameDirectory", "${result.filePaths[0].replaceAll("\\", "/")}")`)

        // send it back to the renderer
        // win.webContents.send('selected-dirs', result.filePaths[0].replaceAll("\\", "/"))
        event.returnValue = result
      }
    })

    ipcMain.on('get-game-state', async (event, arg) => {

      console.log(arg)

      const startFile = fs.existsSync(`${arg.path}/${arg.version == 1 ? 'highRes' : 'lowRes'}/KnockoutCity/KnockoutCity.exe`)
      if(startFile) return event.returnValue = "installed"
      else return event.returnValue = "notInstalled"
    })

    ipcMain.on('download-game', async (event, arg) => {
      console.log("Starting download")
      let cancelled = false
      event.returnValue = "downloading"

      if(!fs.existsSync(arg.path)) fs.mkdirSync(arg.path, { recursive: true })

      let fileSize = 0;
      if (fs.existsSync(`${arg.path}/files-${arg.version}.zip`)) {
        const stats = fs.statSync(`${arg.path}/files-${arg.version}.zip`);
        fileSize = stats.size;
      }

      let options = {
        headers: {
          "Range": `bytes=${fileSize}-`
        }
      }

      const downloadCallback = (res) => {
        const writeStream = fs.createWriteStream(`${arg.path}/files-${arg.version}.zip`, { flags: 'a' });
        if(fileSize > 0) console.log("Resuming download")

        res.pipe(writeStream);

        writeStream.on('finish', () => {
          if(cancelled) return
          writeStream.close();
          win.webContents.executeJavaScript(`window.postMessage({type: "download-progress", data: 100})`)
          console.log("Downloaded");
          // unzip the file
          try {
            if(fs.existsSync(`${arg.path}/${arg.version == 1 ? 'highRes' : 'lowRes'}`)) fs.rmdirSync(`${arg.path}/${arg.version == 1 ? 'highRes' : 'lowRes'}`, { recursive: true })
            fs.mkdirSync(`${arg.path}/${arg.version == 1 ? 'highRes' : 'lowRes'}`)

            fs.createReadStream(`${arg.path}/files-${arg.version}.zip`)
            .pipe(unzipper.Extract({ path: `${arg.path}/${arg.version == 1 ? 'highRes' : 'lowRes'}` }))
            .on("finish", () => {
              console.log("Files unzipped successfully");
              fs.rmSync(`${arg.path}/files-${arg.version}.zip`)
              win.reload()
            });
          } catch (err) {
            console.log(err)
            dialog.showMessageBox(win, {
              type: "error",
              title: "Unexpected Error",
              message: "An error occurred while unzipping the files. Error: " + err.message
            })
          }
        });

        res.on('data', (chunk) => {
          win.webContents.executeJavaScript(`window.postMessage({type: "download-progress", data: ${roundToDecimalPlace(((fileSize + writeStream.bytesWritten) / res.headers['content-length']) * 100, 2)}})`)
        });

        ipcMain.once('cancel-download', async (event, arg) => {
          console.log("Canceling download")
          cancelled = true
          res.destroy()
          writeStream.close()
        })

        win.on('close', () => {
          console.log("Canceling download")
          res.destroy()
          writeStream.close()
        })
      }

      https.get(arg.version == 1 ? "https://chonky-delivery-network.akamaized.net/KnockoutCity-HighRes-10.0-264847.zip" : "https://chonky-delivery-network.akamaized.net/KnockoutCity-LowRes-10.0-264847.zip", fileSize > 0 ? options : downloadCallback, downloadCallback)

      

      // downloader.download().then(() => {
      //   console.log("Downloaded");
      //   win.reload()
      // }).catch((err) => {
      //   console.log(err);
      //   if(err.message.includes("tempPath is not defined")) {
      //     win.webContents.executeJavaScript(`window.postMessage({type: "download-error", data: "This directory requires administrator permissions. Please restart this launcher as an administrator."})`)
      //     dialog.showMessageBox(win, {
      //       type: "error",
      //       title: "Missing Permissions",
      //       message: "The selected directory requires administrator permissions. Please restart the launcher as an administrator."
      //     })
      //   } else if (!err.message.includes("Request cancelled")) {
      //     win.webContents.executeJavaScript(`window.postMessage({type: "download-error", data: "An unknown error has occurred. Please try again later."})`)
      //     dialog.showMessageBox(win, {
      //       type: "error",
      //       title: "Unknown Error",
      //       message: "An unknown error has occurred. " + err.message
      //     })
      //   }
      // });
    })


    ipcMain.on('launch-game', async (event, arg) => {
      console.log("Launching game")     

      const args = [`-lang=${arg.language || 'en'}`, `-username=${arg.username}`, `-backend=${arg.server}`];
      const process = spawn(`${arg.path}/${arg.version == 1 ? 'highRes' : 'lowRes'}/KnockoutCity/KnockoutCity.exe`, args, { 
        cwd: `${arg.path}/${arg.version == 1 ? 'highRes' : 'lowRes'}/KnockoutCity`,
        detached: true,
        stdio: 'ignore',
        
      })
      console.log(process.spawnargs)
      event.returnValue = "launched"
      process.on('error', (err) => {
        console.log(err)
        dialog.showMessageBox(win, {
          type: "error",
          title: "Unexpected Error",
          message: "An error occurred while launching the game. Error: " + err.message
        })
      })

      process.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        win.webContents.executeJavaScript(`window.postMessage({type: "game-closed"})`)
      });
    })
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  axios.get("http://cdn.ipgg.net/kocity/version").then(async (res) => {
    console.log("Checking update")
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

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
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

// Function that rounds a number to a certain number of decimal places
function roundToDecimalPlace(number, decimalPlaces) {
  return Math.round(number * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
}