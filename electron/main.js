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

function getEpicPath() {
  const isWin = process.platform === 'win32';
  if (!isWin) return null;

  // Epics manifests are always at ProgramData regardless of install location
  const manifestPath = 'C:\\ProgramData\\Epic\\EpicGamesLauncher\\Data\\Manifests';
  if (fs.existsSync(manifestPath)) return manifestPath;

  // Try registry to confirm Epic is installed
  try {
    const { execSync } = require('child_process');
    const regOutput = execSync(
      'reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Epic Games\\EpicGamesLauncher" /v AppDataPath 2>nul',
      { encoding: 'utf-8' }
    );
    const match = regOutput.match(/AppDataPath\s+REG_SZ\s+(.+)/);
    if (match && match[1]) {
      const dataPath = path.join(match[1].trim(), 'Manifests');
      if (fs.existsSync(dataPath)) return dataPath;
    }
  } catch (e) {
    // registry query failed
  }

  return null;
}

function getXboxPaths() {
  const isWin = process.platform === 'win32';
  if (!isWin) return [];

  const paths = [];

  // Check if Xbox app is installed via AppX package
  try {
    const { execSync } = require('child_process');
    const result = execSync(
      'powershell -Command "Get-AppxPackage Microsoft.GamingApp | Select-Object -ExpandProperty InstallLocation" 2>nul',
      { encoding: 'utf-8' }
    ).trim();
    if (result && fs.existsSync(result)) {
      // Xbox app installed, now find game directories
      // Default XboxGames folders on all drives
      try {
        const drivesOutput = execSync(
          'wmic logicaldisk where drivetype=3 get deviceid 2>nul',
          { encoding: 'utf-8' }
        );
        const drives = drivesOutput.match(/[A-Z]:/g) || [];
        for (const drive of drives) {
          const xboxDir = path.join(drive, 'XboxGames');
          if (fs.existsSync(xboxDir)) {
            paths.push(xboxDir);
          }
        }
      } catch (e) {
        // wmic failed, try common drives
        for (const drive of ['C:', 'D:', 'E:', 'F:']) {
          const xboxDir = path.join(drive, 'XboxGames');
          if (fs.existsSync(xboxDir)) {
            paths.push(xboxDir);
          }
        }
      }
    }
  } catch (e) {
    // PowerShell or AppX check failed
  }

  // Fallback: check common XboxGames directories
  if (paths.length === 0) {
    for (const drive of ['C:', 'D:', 'E:', 'F:']) {
      const xboxDir = path.join(drive, 'XboxGames');
      if (fs.existsSync(xboxDir)) {
        paths.push(xboxDir);
      }
    }
  }

  return paths;
}

function getInstalledGamesFromRegistry() {
  const games = [];
  const isWin = process.platform === 'win32';
  if (!isWin) return games;

  const { execSync } = require('child_process');

  // Game publisher / name filter keywords
  const gamePublishers = [
    'miHoYo', 'mihoyo', '米哈游', 'Hoyoverse', 'cognosphere',
    'Netease', '网易', 'Tencent', '腾讯',
    'Electronic Arts', 'Ubisoft', 'Activision', 'Blizzard',
    'Square Enix', 'Capcom', 'Bandai Namco', 'Sega', 'Bethesda',
    'Microsoft Studios', 'Xbox Game Studios', 'Rockstar Games', 'Valve',
    'CD Projekt', 'Warner Bros', '2K', 'Focus Entertainment',
    'Paradox Interactive', 'Frontier Developments', 'Klei', 'Devolver',
    'Annapurna Interactive', 'Team17', 'Curve Digital', 'THQ Nordic',
    'GOG', 'Riot Games',
  ];
  const gameKeywords = [
    'game', 'Game', 'GAME',
    '原神', '崩坏', '星穹铁道', '崩铁',
    '燕云十六声', '永劫无间', '逆水寒',
    'Cyberpunk', 'Witcher', 'Elder Scrolls', 'Fallout',
    'Call of Duty', 'Battlefield', 'Assassin\'s Creed', 'Far Cry',
    'Final Fantasy', 'Resident Evil', 'Monster Hunter', 'Dark Souls',
    'Forza', 'Halo', 'Gears of War', 'Age of Empires',
    'Civilization', 'Cities: Skylines', 'The Sims', 'Stardew Valley',
    'Minecraft', 'Terraria', 'Factorio', 'RimWorld',
    'Dota', 'League of Legends', 'Valorant', 'Overwatch',
    'Apex Legends', 'Fortnite', 'PUBG', 'Counter-Strike',
  ];

  // Build PowerShell command to query all three registry paths
  const regPaths = [
    'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
    'HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
    'HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
  ];

  try {
    const psCmd =
      regPaths.map(rp => `Get-ChildItem '${rp}' -ErrorAction SilentlyContinue`).join(',') +
      ` | ForEach-Object { Get-ItemProperty $_.PsPath }` +
      ` | Where-Object { $_.DisplayName -and $_.InstallLocation }` +
      ` | Select-Object DisplayName, InstallLocation, Publisher, DisplayIcon` +
      ` | ConvertTo-Json -Compress`;

    const result = execSync(
      `powershell -NoProfile -Command "${psCmd.replace(/"/g, '\\"')}"`,
      { encoding: 'utf-8', timeout: 15000, maxBuffer: 5 * 1024 * 1024 }
    );

    if (!result || result.trim() === '') return [];

    let items;
    try {
      items = JSON.parse(result);
      if (!Array.isArray(items)) items = items ? [items] : [];
    } catch (e) {
      return [];
    }

    for (const item of items) {
      const name = (item.DisplayName || '').trim();
      const publisher = (item.Publisher || '').trim();
      let installPath = (item.InstallLocation || '').trim().replace(/^"|"$/g, '');
      const displayIcon = (item.DisplayIcon || '').trim();

      if (!name || !installPath) continue;
      if (!fs.existsSync(installPath)) continue;

      // Skip system components, runtimes, tools
      if (/update|redist|runtime|vc_|dotnet|framework|directx|driver|sdk/i.test(name)) continue;
      if (/microsoft\\windows|adobe|java|oracle|intel|amd|nvidia/i.test(publisher)) continue;

      // Match by publisher or game name keyword
      const isGame =
        gamePublishers.some(p => publisher.toLowerCase().includes(p.toLowerCase())) ||
        gameKeywords.some(k => name.toLowerCase().includes(k.toLowerCase()));

      if (isGame) {
        let exePath = null;
        // Try DisplayIcon first
        if (displayIcon && !/unins/i.test(displayIcon)) {
          const iconPath = displayIcon.split(',')[0].replace(/^"|"$/g, '');
          if (fs.existsSync(iconPath) && iconPath.endsWith('.exe')) {
            exePath = iconPath;
          }
        }
        // Fallback: search install dir recursively
        if (!exePath) {
          exePath = findExeInDir(installPath, 3);
        }

        games.push({
          title: name,
          platform: 'standalone',
          install_path: installPath,
          exe_path: exePath,
        });
      }
    }
  } catch (e) {
    console.error('Registry scan error:', e.message);
  }

  return games;
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
  const epicPath = getEpicPath();
  if (epicPath) {
    platforms.push({ id: 'epic', name: 'Epic Games', path: epicPath, installed: true });
  }

  // Xbox / Microsoft Store detection
  const xboxPaths = getXboxPaths();
  if (xboxPaths.length > 0) {
    platforms.push({ id: 'xbox', name: 'Xbox', path: xboxPaths[0], installed: true });
  }

  // Independent / standalone games (registry-based)
  const standaloneGames = getInstalledGamesFromRegistry();
  if (standaloneGames.length > 0) {
    platforms.push({ id: 'standalone', name: '独立游戏', path: 'registry', installed: true, count: standaloneGames.length });
  }

  // Add undetected platforms as not-installed
  const allPlatforms = [
    { id: 'steam', name: 'Steam' },
    { id: 'epic', name: 'Epic Games' },
    { id: 'xbox', name: 'Xbox' },
    { id: 'standalone', name: '独立游戏' },
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

  if (platform === 'epic') {
    try {
      const epicPath = getEpicPath();
      if (!epicPath) return games;

      const files = fs.readdirSync(epicPath);
      for (const file of files) {
        if (file.endsWith('.item')) {
          try {
            const manifest = fs.readFileSync(path.join(epicPath, file), 'utf-8');
            const json = JSON.parse(manifest);
            const name = json.DisplayName || json.AppName;
            const installPath = json.InstallLocation;
            if (name) {
              games.push({
                title: name,
                platform: 'epic',
                app_id: json.CatalogItemId || json.AppName,
                install_path: installPath || null,
              });
            }
          } catch (e) {
            // skip malformed manifests
          }
        }
      }
    } catch (e) {
      console.error('Epic scan error:', e);
    }
  }

  if (platform === 'xbox') {
    try {
      const xboxPaths = getXboxPaths();
      for (const xboxPath of xboxPaths) {
        if (!fs.existsSync(xboxPath)) continue;
        const entries = fs.readdirSync(xboxPath, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const gamePath = path.join(xboxPath, entry.name);
            // Look for the game executable in the Xbox game folder
            try {
              const gameEntries = fs.readdirSync(gamePath, { withFileTypes: true });
              // Xbox games are typically organized in subfolders with Content/ etc.
              // Try to find .exe files recursively
              const exe = findExeInDir(gamePath, 3);
              games.push({
                title: entry.name.replace(/[_-]/g, ' '),
                platform: 'xbox',
                install_path: gamePath,
                exe_path: exe || null,
              });
            } catch (e) {
              // skip inaccessible directories
            }
          }
        }
      }
    } catch (e) {
      console.error('Xbox scan error:', e);
    }
  }

  if (platform === 'standalone') {
    try {
      const standaloneGames = getInstalledGamesFromRegistry();
      games.push(...standaloneGames);
    } catch (e) {
      console.error('Standalone game scan error:', e);
    }
  }

  return games;
}

function findExeInDir(dirPath, maxDepth) {
  if (maxDepth < 0) return null;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isFile() && entry.name.endsWith('.exe')) {
        return fullPath;
      }
      if (entry.isDirectory()) {
        const found = findExeInDir(fullPath, maxDepth - 1);
        if (found) return found;
      }
    }
  } catch (e) {
    // skip inaccessible
  }
  return null;
}

function scanDirectory(dirPath, maxDepth = 5) {
  const games = [];

  function scan(currentPath, depth) {
    if (depth > maxDepth) return;
    try {
      if (!fs.existsSync(currentPath)) return;

      const entries = fs.readdirSync(currentPath, { withFileTypes: true });
      const exeFiles = [];
      const subDirs = [];

      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.exe')) {
          exeFiles.push(entry);
        }
        if (entry.isDirectory()) {
          subDirs.push(entry);
        }
      }

      // If this directory has .exe files, treat it as a game
      if (exeFiles.length > 0) {
        // Prefer a .exe that looks like a game launcher (not uninstaller/installer)
        const gameExe = exeFiles.find((e) =>
          !/unins|setup|install|update|redist|dotnet|vc_redist|dxsetup/i.test(e.name)
        ) || exeFiles[0];

        games.push({
          title: path.basename(currentPath).replace(/[_-]/g, ' '),
          exe_path: path.join(currentPath, gameExe.name),
          install_path: currentPath,
          platform: 'manual',
        });
      }

      // Recurse into subdirectories
      for (const subDir of subDirs) {
        scan(path.join(currentPath, subDir.name), depth + 1);
      }
    } catch (e) {
      // skip inaccessible directories
    }
  }

  scan(dirPath, 0);
  return games;
}
