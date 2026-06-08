const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const Database = require('./database');

let mainWindow = null;
let db = null;

// ─── Single Instance Lock ─────────────────────────────────────
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

function getIconPath() {
  // In development, icon is in project root/build/
  // In production (packaged), icon is in resources/
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    return path.join(__dirname, '..', 'icons', 'icon.png');
  }
  return path.join(process.resourcesPath, 'icon.png');
}

// ─── Window Creation ──────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#07080f',
    frame: false,
    transparent: false,
    titleBarStyle: 'hidden',
    show: false,
    icon: getIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Load content
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ─── App Lifecycle ────────────────────────────────────────────
app.whenReady().then(() => {
  // Initialize database
  const userDataPath = app.getPath('userData');
  db = new Database(userDataPath);
  db.init();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ─── IPC: Window Management ──────────────────────────────────
ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize();
});

ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.handle('window:close', () => {
  mainWindow?.close();
});

ipcMain.handle('window:is-maximized', () => {
  return mainWindow?.isMaximized() ?? false;
});

ipcMain.handle('app:platform', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    version: app.getVersion(),
    name: app.getName(),
  };
});

// ─── IPC: Games ──────────────────────────────────────────────
ipcMain.handle('games:get-all', (_, filters) => {
  return db.getAllGames(filters);
});

ipcMain.handle('games:get', (_, id) => {
  return db.getGame(id);
});

ipcMain.handle('games:save', (_, game) => {
  return db.saveGame(game);
});

ipcMain.handle('games:delete', (_, id) => {
  return db.deleteGame(id);
});

ipcMain.handle('games:stats', () => {
  return db.getStats();
});

ipcMain.handle('games:recent', (_, limit = 10) => {
  return db.getRecentGames(limit);
});

// ─── IPC: Scanning ───────────────────────────────────────────
ipcMain.handle('scan:platforms', () => {
  return scanPlatforms();
});

ipcMain.handle('scan:platform-games', (_, platform) => {
  return scanPlatformGames(platform);
});

ipcMain.handle('scan:directory', (_, dirPath) => {
  return scanDirectory(dirPath);
});

// ─── IPC: Settings ───────────────────────────────────────────
ipcMain.handle('settings:get', (_, key) => {
  return db.getSetting(key);
});

ipcMain.handle('settings:set', (_, key, value) => {
  db.setSetting(key, value);
  return true;
});

ipcMain.handle('settings:get-all', () => {
  return db.getAllSettings();
});

// ─── IPC: Dialogs ────────────────────────────────────────────
ipcMain.handle('dialog:open-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: '选择游戏目录',
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.handle('shell:open-path', async (_, p) => {
  return await shell.openPath(p);
});

ipcMain.handle('shell:show-item', (_, p) => {
  shell.showItemInFolder(p);
});

// ─── Platform Scanner ────────────────────────────────────────
const fs = require('fs');

function getSteamPath() {
  const isWin = process.platform === 'win32';
  if (!isWin) {
    const homePath = path.join(require('os').homedir(), '.steam/steam');
    return fs.existsSync(homePath) ? homePath : null;
  }

  // Try registry first (supports custom install paths)
  try {
    const { execSync } = require('child_process');
    const regOutput = execSync(
      'reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Valve\\Steam" /v InstallPath 2>nul',
      { encoding: 'utf-8' }
    );
    const match = regOutput.match(/InstallPath\s+REG_SZ\s+(.+)/);
    if (match && match[1]) {
      const regPath = match[1].trim();
      if (fs.existsSync(regPath)) return regPath;
    }
  } catch (e) {
    // registry query failed, fall through to hardcoded paths
  }

  // Fallback to common paths
  const fallbackPaths = ['C:\\Program Files (x86)\\Steam', 'C:\\Program Files\\Steam'];
  for (const sp of fallbackPaths) {
    if (fs.existsSync(sp)) return sp;
  }
  return null;
}

function scanPlatforms() {
  const platforms = [];
  const isWin = process.platform === 'win32';

  // Steam detection
  const steamPath = getSteamPath();
  if (steamPath) {
    platforms.push({ id: 'steam', name: 'Steam', path: steamPath, installed: true });
  }

  // Epic Games detection
  const epicPaths = isWin
    ? ['C:\\ProgramData\\Epic\\EpicGamesLauncher\\Data\\Manifests']
    : [];

  for (const ep of epicPaths) {
    if (fs.existsSync(ep)) {
      platforms.push({ id: 'epic', name: 'Epic Games', path: ep, installed: true });
      break;
    }
  }

  // Xbox / Microsoft Store detection
  const xboxPath = isWin ? 'C:\\XboxGames' : null;
  if (xboxPath && fs.existsSync(xboxPath)) {
    platforms.push({ id: 'xbox', name: 'Xbox', path: xboxPath, installed: true });
  }

  // Add undetected platforms as not-installed
  const allPlatforms = [
    { id: 'steam', name: 'Steam' },
    { id: 'epic', name: 'Epic Games' },
    { id: 'xbox', name: 'Xbox' },
  ];
  for (const ap of allPlatforms) {
    if (!platforms.find((p) => p.id === ap.id)) {
      platforms.push({ ...ap, path: null, installed: false });
    }
  }

  return platforms;
}

function scanPlatformGames(platform) {
  const games = [];

  if (platform === 'steam') {
    try {
      const steamPath = getSteamPath();
      if (!steamPath) return games;

      // Try to read libraryfolders.vdf for game locations
      const vdfPath = path.join(steamPath, 'steamapps', 'libraryfolders.vdf');
      if (fs.existsSync(vdfPath)) {
        const content = fs.readFileSync(vdfPath, 'utf-8');
        // Simple parser for Steam VDF library folders
        const pathMatches = content.match(/"path"\s+"([^"]+)"/g);
        if (pathMatches) {
          for (const match of pathMatches) {
            const libPath = match.replace(/"path"\s+"/, '').replace(/"/, '').replace(/\\\\/g, '\\');
            const appsDir = path.join(libPath, 'steamapps');
            if (fs.existsSync(appsDir)) {
              const files = fs.readdirSync(appsDir);
              for (const file of files) {
                if (file.startsWith('appmanifest_') && file.endsWith('.acf')) {
                  try {
                    const manifest = fs.readFileSync(path.join(appsDir, file), 'utf-8');
                    const nameMatch = manifest.match(/"name"\s+"([^"]+)"/);
                    const appIdMatch = manifest.match(/"appid"\s+"([^"]+)"/);
                    const installDirMatch = manifest.match(/"installdir"\s+"([^"]+)"/);
                    if (nameMatch && appIdMatch) {
                      const name = nameMatch[1];
                      // Skip Steamworks Common Redistributables and tools
                      if (name.includes('Redistributable') || name.includes('Proton') || name.includes('Steamworks')) continue;
                      games.push({
                        title: name,
                        platform: 'steam',
                        app_id: appIdMatch[1],
                        install_path: installDirMatch
                          ? path.join(appsDir, 'common', installDirMatch[1])
                          : null,
                      });
                    }
                  } catch (e) {
                    // skip malformed manifests
                  }
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.error('Steam scan error:', e);
    }
  }

  return games;
}

function scanDirectory(dirPath) {
  const games = [];
  try {
    if (!fs.existsSync(dirPath)) return games;

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const exeFiles = [];

    // Look for .exe files (Windows) or common game indicators
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.exe')) {
        exeFiles.push({
          title: entry.name.replace('.exe', '').replace(/[_-]/g, ' '),
          exe_path: path.join(dirPath, entry.name),
          install_path: dirPath,
          platform: 'manual',
        });
      }
      // Check subdirectories one level deep
      if (entry.isDirectory()) {
        const subPath = path.join(dirPath, entry.name);
        try {
          const subEntries = fs.readdirSync(subPath);
          const subExes = subEntries.filter((f) => f.endsWith('.exe'));
          if (subExes.length > 0) {
            games.push({
              title: entry.name.replace(/[_-]/g, ' '),
              exe_path: path.join(subPath, subExes[0]),
              install_path: subPath,
              platform: 'manual',
            });
          }
        } catch (e) {
          // skip inaccessible directories
        }
      }
    }

    // Add top-level exes if no subdirectory games found
    if (games.length === 0) {
      games.push(...exeFiles);
    }
  } catch (e) {
    console.error('Directory scan error:', e);
  }

  return games;
}
