const { remote, ipcRenderer } = require("electron");
const {
  getCurrentWindow,
  openMenu,
  minimizeWindow,
  unmaximizeWindow,
  maxUnmaxWindow,
  isWindowMaximized,
  closeWindow,
} = require("./menu-functions");

if(!localStorage.getItem("username")) {
  // get username from system
  const username = require("os").userInfo().username;
  localStorage.setItem("username", username);
}
if(!localStorage.getItem("gameVersion")) localStorage.setItem("gameVersion", "1")
if(!localStorage.getItem("language")) localStorage.setItem("language", "en")
if(!localStorage.getItem("currServerName")) localStorage.setItem("currServerName", "localhost")
if(!localStorage.getItem("currServer")) localStorage.setItem("currServer", "127.0.0.1")
if(localStorage.getItem("servers") === null) localStorage.setItem("servers", '[{"name":"localhost","ip":"127.0.0.1"}]')

// catch a STRG + R 
document.addEventListener("keydown", (e) => {
  if (e.key === "r" && e.ctrlKey) {
    e.preventDefault();
  }
  // f5
  if (e.key === "F5") {
    e.preventDefault();
  }
});

window.addEventListener("DOMContentLoaded", () => {
  window.getCurrentWindow = getCurrentWindow;
  window.openMenu = openMenu;
  window.minimizeWindow = minimizeWindow;
  window.unmaximizeWindow = unmaximizeWindow;
  window.maxUnmaxWindow = maxUnmaxWindow;
  window.isWindowMaximized = isWindowMaximized;
  window.closeWindow = closeWindow;

  window.selectGameDir = async () => {
    const result = await ipcRenderer.sendSync('select-dirs')
    if (!result.canceled) {
      return Promise.resolve(result.filePaths[0].replaceAll("\\", "/"))
    }
  }

  window.getGameState = async () => {
    const result = await ipcRenderer.sendSync('get-game-state', { path: localStorage.getItem("gameDirectory"), version: localStorage.getItem("gameVersion")})
    return Promise.resolve(result)
  }

  window.installGame = async (props) => {
    const result = await ipcRenderer.sendSync('download-game', { path: localStorage.getItem("gameDirectory"), version: localStorage.getItem("gameVersion") })
    props.setGameState("installing")
    window.addEventListener('message', evt => {
      if (evt.data.type === 'download-progress') {
        props.setInstallData(evt.data.data)
      }
      if  (evt.data.type === 'download-error') {
        props.setGameState("notInstalled")
      }
    })
  }

  window.launchGame = async (props) => {
    ipcRenderer.sendSync('launch-game', { 
      path: localStorage.getItem("gameDirectory"), 
      version: localStorage.getItem("gameVersion"), 
      username: localStorage.getItem("username"),
      language: localStorage.getItem("language"),
      server: localStorage.getItem("currServer"),
    })
    props.setGameState("running")

    window.addEventListener('message', evt => {
      if (evt.data.type === 'game-closed') {
        console.log("Game closed")
        props.setGameState("installed")
      }
    })
  }

  window.cancelInstall = async () => {
    ipcRenderer.send('cancel-download')
  }
});