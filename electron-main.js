const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

function createWindow() {
  // Start the Python server
  const pythonPath = process.platform === 'win32' ? 'python' : 'python3';
  serverProcess = spawn(pythonPath, ['server.py'], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  // Wait a bit for server to start
  setTimeout(() => {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      },
      icon: path.join(__dirname, 'favicon.png'),
      titleBarStyle: 'default'
    });

    // Load the local server
    mainWindow.loadURL('http://localhost:5000');

    // Remove menu bar for app-like feel
    mainWindow.setMenuBarVisibility(false);

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }, 3000); // Wait 3 seconds for server to start
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  // Kill the Python server
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});