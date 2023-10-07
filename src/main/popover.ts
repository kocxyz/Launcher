import { is } from '@electron-toolkit/utils'
import { BrowserWindow, Notification } from 'electron'
import path from 'path'

export default async function presentPopover(props: {
  screen: Electron.Display
  title: string
  message: string
  ttl?: number
}): Promise<void> {
  const { screen, title, message, ttl } = props

  const window = new BrowserWindow({
    x: screen.bounds.x + screen.bounds.width - 500,
    y: 150,
    width: 500,
    height: 150,
    frame: false,
    resizable: false,
    focusable: false,
    show: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  window.setIgnoreMouseEvents(true)

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    window.loadFile(path.join(process.env['ELECTRON_RENDERER_URL'], '../../resources/popover.html'))
  } else {
    window.loadFile(path.join(__dirname, '../../resources/popover.html'))
  }

  window.webContents.on('did-finish-load', () => {
    window.webContents.executeJavaScript(`
    window.ttl = ${ttl || 5000};
    document.getElementById('title').innerText = '${title}';
    document.getElementById('message').innerText = '${message}'
    `)
    window.show()
    window.setAlwaysOnTop(true, 'floating')
    window.setFullScreenable(false)
  })

  new Notification({
    title,
    body: message
  }).show()
}
