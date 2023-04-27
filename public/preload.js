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

if(localStorage.getItem("discordRPC:enabled") === null) localStorage.setItem("discordRPC:enabled", "true")
if(localStorage.getItem("discordRPC:displayName") === null) localStorage.setItem("discordRPC:displayName", "true")

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

window.updateRPC = async () => {
  ipcRenderer.sendSync('set-RPCstate', { 
    enabled: localStorage.getItem("discordRPC:enabled") === "true",
    displayName: localStorage.getItem("discordRPC:displayName") === "true",
  })
}

window.updateRPC()


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
    if (!result) {
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
      serverName: localStorage.getItem("currServerName"),
    })
    props.setGameState("running")

    const listener = evt => {
      switch (evt.data.type) {
        case 'game-closed':
          console.log("Game closed")
          props.setGameState("installed")
          // remove listener
          window.removeEventListener('message', listener)
          break;
      }
    }

    window.addEventListener('message', listener)
  }


  window.startServer = async (props) => {
    ipcRenderer.sendSync('start-server', {
      path: localStorage.getItem("gameDirectory"),
      version: localStorage.getItem("gameVersion"),
      server: localStorage.getItem("currServer"),

      port: props.port,
      maxUsers: props.maxUsers,
      secret: props.secret,
      showTerminal: props.showTerminal,
    })
    props.setServerState("starting")
    
    const listener = evt => {
      switch (evt.data.type) {
        case 'server-closed':
          console.log("Server closed")
          props.setServerState("")
          // remove listener
          window.removeEventListener('message', listener)
          break;
        case 'server-ready':
          console.log("Server ready")
          props.setServerState("running")
          break;
      }
    }

    window.addEventListener('message', listener)
  }

  window.stopServer = async (props) => {
    props.setServerState("stopping")
    ipcRenderer.sendSync('stop-server', {
      path: localStorage.getItem("gameDirectory"),
      version: localStorage.getItem("gameVersion"),
      server: localStorage.getItem("currServer"),
    })
    
  }

  window.cancelInstall = async () => {
    ipcRenderer.send('cancel-download', { path: localStorage.getItem("gameDirectory"), version: localStorage.getItem("gameVersion") })
  }

  window.pauseInstall = async () => {
    ipcRenderer.send('pause-download', { path: localStorage.getItem("gameDirectory"), version: localStorage.getItem("gameVersion") })
  }
});

Array.prototype.scrable = function () {
  var i = this.length;
  while (i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = this[i];
    this[i] = this[j];
    this[j] = temp;
  }
  return this;
};