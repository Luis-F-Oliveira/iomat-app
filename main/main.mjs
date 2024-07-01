import { config } from 'dotenv'
import { app, BrowserWindow, session } from 'electron'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import CryptoJS from 'crypto-js'
import path from 'path'

config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
let app_key = process.env.APP_KEY
app_key = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(app_key))

const createWindow = async () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (app.isPackaged) {
    const { default: serve } = await import('electron-serve')
    const appServe = serve({ directory: path.join(__dirname, '../out') })
    appServe(win).then(() => {
      win.loadURL('app://-')
    })
  } else {
    win.loadURL('http://localhost:3000')
    win.webContents.openDevTools()
    win.webContents.on('did-fail-load', () => {
      win.webContents.reloadIgnoringCache()
    })
  }
}

app.on('ready', async () => {
  const cookie = {
    url: 'http://localhost:3000',
    name: 'application',
    value: app_key,
  }
  await session.defaultSession.cookies.set(cookie)
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
