const { app, BrowserWindow } = require('electron')
const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

let mainWindow = null
let nextServer = null

const isDev = !app.isPackaged
const appDataDir = app.getPath('userData')
const dbPath = path.join(appDataDir, 'atenea.db')
const port = process.env.PORT || '3000'
const startUrl = process.env.ELECTRON_START_URL || `http://localhost:${port}`

function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 700,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  mainWindow.loadURL(startUrl)

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

async function waitForServer(url, timeoutMs = 30000) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok || response.status < 500) return
    } catch (_error) {
      // Server is not ready yet.
    }

    await new Promise((resolve) => setTimeout(resolve, 600))
  }

  throw new Error(`Next server did not become ready within ${timeoutMs}ms`)
}

function resolveNextCliPath() {
  if (isDev) {
    return path.join(app.getAppPath(), 'node_modules', 'next', 'dist', 'bin', 'next')
  }

  return path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', 'next', 'dist', 'bin', 'next')
}

function startNextServer() {
  if (process.env.ELECTRON_START_URL) {
    return null
  }

  ensureDirExists(appDataDir)

  const env = {
    ...process.env,
    NODE_ENV: isDev ? 'development' : 'production',
    PORT: String(port),
    DATABASE_URL: `file:${dbPath}`,
    JWT_SECRET: process.env.JWT_SECRET || 'atenea-electron-local-secret',
  }

  const nextCliPath = resolveNextCliPath()
  const commandArgs = isDev ? ['dev', '-p', String(port)] : ['start', '-p', String(port)]

  nextServer = spawn(process.execPath, [nextCliPath, ...commandArgs], {
    cwd: app.getAppPath(),
    env,
    stdio: 'inherit',
  })

  nextServer.on('exit', (code) => {
    if (code !== 0) {
      console.error('Next server exited with code:', code)
    }
  })

  return nextServer
}

function stopNextServer() {
  if (!nextServer || nextServer.killed) return
  nextServer.kill('SIGTERM')
}

app.whenReady().then(async () => {
  try {
    startNextServer()
    await waitForServer(startUrl)
    createMainWindow()
  } catch (error) {
    console.error('Failed to start Electron app:', error)
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  stopNextServer()
})
