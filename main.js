const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');

function runCmd(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) return reject(stderr || error.message);
      resolve(stdout || stderr);
    });
  });
}

async function ensureNetwork() {
  try {
    await runCmd('docker network inspect sandbox-net');
  } catch {
    await runCmd('docker network create sandbox-net');
  }
}

async function startContainer() {
  await ensureNetwork();

  const sandboxHome = path.join(__dirname, 'sandbox', 'sandbox-home');

  const cmd = [
    'docker run -d --name sandbox-browser',
    '--network sandbox-net',
    `-v "${sandboxHome}:/home/seluser/Downloads"`,
    'selenium/standalone-chrome'
  ].join(' ');

  return runCmd(cmd);
}

async function stopContainer() {
  return runCmd('docker stop sandbox-browser');
}

async function removeContainer() {
  return runCmd('docker rm sandbox-browser');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('sandbox:start', async () => {
  return startContainer();
});

ipcMain.handle('sandbox:stop', async () => {
  try {
    return await stopContainer();
  } catch (e) {
    return String(e);
  }
});

ipcMain.handle('sandbox:reset', async () => {
  try {
    await stopContainer();
  } catch (e) {
  }
  try {
    await removeContainer();
  } catch (e) {
  }
  return startContainer();
});

ipcMain.handle('sandbox:logs', async () => {
  try {
    return await runCmd('docker logs --tail 100 sandbox-browser');
  } catch (e) {
    return 'No logs yet or container not running.\n' + String(e);
  }
});
