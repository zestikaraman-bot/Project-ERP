
const { app, BrowserWindow, session } = require('electron');
const path = require('path');

function createWindow() {
  const isDev = !app.isPackaged;

  // Security: Handle Content Security Policy for esm.sh
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://esm.sh; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://esm.sh; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com;"]
      }
    });
  });

  const win = new BrowserWindow({
    width: 1366,
    height: 900,
    title: "ABC Spice Industries - ERP System",
    backgroundColor: '#0f172a', // Matches Slate-900
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // Necessary for loading modules from esm.sh in local files
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:3000');
    // win.webContents.openDevTools();
  } else {
    // In production, we load the relative path
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
