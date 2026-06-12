const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const https = require('https');
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

// ─── IPC: Auto-Import ────────────────────────────────────────
ipcMain.handle('games:auto-import', async () => {
  // Scan all detected platforms and auto-import games not yet in the library
  const platforms = scanPlatforms();
  const existingGames = db.getAllGames().games;
  const existingKeys = new Set(
    existingGames.map((g) => `${g.title}|${g.platform}`)
  );

  let imported = 0;
  const platformIds = ['steam', 'epic', 'xbox', 'standalone'];

  for (const pId of platformIds) {
    const platformInfo = platforms.find((p) => p.id === pId && p.installed);
    if (!platformInfo) continue;

    try {
      const scanned = scanPlatformGames(pId);
      for (const game of scanned) {
        const key = `${game.title}|${game.platform}`;
        if (existingKeys.has(key)) continue;
        db.saveGame({
          title: game.title,
          platform: game.platform,
          app_id: game.app_id || null,
          install_path: game.install_path || null,
          exe_path: game.exe_path || null,
          status: game.status || (game.install_path ? 'installed' : 'missing'),
          genres: [],
          playtime: 0,
          size: 0,
        });
        existingKeys.add(key);
        imported++;
      }
    } catch (e) {
      console.error(`Auto-import ${pId} error:`, e.message);
    }
  }

  // ── Manual scan directories ──────────────────────────────
  const savedScanDirs = db.getSetting('scan_dirs') || [];
  for (const dir of savedScanDirs) {
    if (!fs.existsSync(dir)) continue;
    try {
      const scanned = scanDirectory(dir);
      for (const game of scanned) {
        const key = `${game.title}|${game.platform}`;
        if (existingKeys.has(key)) continue;
        db.saveGame({
          title: game.title,
          platform: game.platform || 'manual',
          app_id: game.app_id || null,
          install_path: game.install_path || null,
          exe_path: game.exe_path || null,
          status: game.status || 'installed',
          genres: [],
          playtime: 0,
          size: 0,
        });
        existingKeys.add(key);
        imported++;
      }
    } catch (e) {
      console.error(`Auto-import manual dir ${dir} error:`, e.message);
    }
  }

  return { imported };
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

// ─── Game Launch ──────────────────────────────────────────────
// Steam games: use steam:// protocol (most reliable, handles DRM & auto-update)
// Other games: use child_process.spawn for fast detached launch
ipcMain.handle('game:launch', async (_, game) => {
  try {
    // Steam: always prefer the steam:// protocol
    if (game.platform === 'steam' && game.app_id) {
      const steamUrl = `steam://rungameid/${game.app_id}`;
      await shell.openExternal(steamUrl);
      return null; // success
    }

    // Non-Steam games: launch the exe directly via spawn (faster than shell.openPath)
    if (game.exe_path && fs.existsSync(game.exe_path)) {
      const { spawn } = require('child_process');
      const exeDir = path.dirname(game.exe_path);
      const child = spawn(game.exe_path, [], {
        cwd: exeDir,
        detached: true,
        stdio: 'ignore',
      });
      child.unref();
      return null; // success
    }

    // Fallback: try shell.openPath on install_path (Xbox UWP apps etc.)
    if (game.install_path && fs.existsSync(game.install_path)) {
      const result = await shell.openPath(game.install_path);
      if (!result) return null;
      return result; // error string from openPath
    }

    return '找不到游戏可执行文件，请检查游戏安装路径';
  } catch (e) {
    return `启动失败: ${e.message}`;
  }
});

// ─── Game Cover Image ────────────────────────────────────────
// Cover image search: Steam library cache → install directory → CDN download → name search

/**
 * Download an image from a URL and return it as a base64 data URL.
 * Needed because Electron's renderer process often blocks direct HTTP
 * image URLs in <img> tags (CSP / context isolation).
 */
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : require('http');
    const request = proto.get(url, { timeout: 8000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadImage(res.headers.location).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) { resolve(null); return; }
      const contentType = res.headers['content-type'] || 'image/jpeg';
      const chunks = [];
      let totalSize = 0;
      const MAX = 5 * 1024 * 1024; // 5 MB
      res.on('data', (chunk) => {
        totalSize += chunk.length;
        if (totalSize > MAX) { res.destroy(); resolve(null); }
        chunks.push(chunk);
      });
      res.on('end', () => {
        try {
          const base64 = Buffer.concat(chunks).toString('base64');
          resolve(`data:${contentType};base64,${base64}`);
        } catch (_) { resolve(null); }
      });
      res.on('error', () => resolve(null));
    });
    request.on('error', () => resolve(null));
    request.on('timeout', () => { request.destroy(); resolve(null); });
  });
}

// Steam manifest name → appId cache (built lazily)
let steamManifestCache = null;

function buildSteamManifestCache() {
  if (steamManifestCache) return steamManifestCache;
  steamManifestCache = new Map();
  const steamPath = getSteamPath();
  if (!steamPath) return steamManifestCache;
  try {
    const vdfPath = path.join(steamPath, 'steamapps', 'libraryfolders.vdf');
    if (!fs.existsSync(vdfPath)) return steamManifestCache;
    const vdfContent = fs.readFileSync(vdfPath, 'utf-8');
    const pathRegex = /"path"\s+"([^"]+)"/g;
    let pathMatch;
    while ((pathMatch = pathRegex.exec(vdfContent)) !== null) {
      const libPath = pathMatch[1].replace(/\\\\/g, '\\');
      const appsDir = path.join(libPath, 'steamapps');
      if (!fs.existsSync(appsDir)) continue;
      for (const file of fs.readdirSync(appsDir)) {
        if (!file.startsWith('appmanifest_') || !file.endsWith('.acf')) continue;
        try {
          const manifest = fs.readFileSync(path.join(appsDir, file), 'utf-8');
          const name = manifest.match(/"name"\s+"([^"]+)"/)?.[1];
          const appId = manifest.match(/"appid"\s+"([^"]+)"/)?.[1];
          if (name && appId) {
            steamManifestCache.set(name.toLowerCase(), appId);
          }
        } catch (_) {}
      }
    }
  } catch (_) {}
  return steamManifestCache;
}

function findSteamAppIdByName(gameName) {
  const cache = buildSteamManifestCache();
  return cache.get(gameName.toLowerCase()) || null;
}

// In-memory cache for cover data URLs (keyed by game id)
const coverCache = {};

// Image file extensions to look for
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.bmp']);

// Common cover image filenames (case-insensitive)
const COVER_FILENAMES = [
  'cover', 'boxart', 'box_art', 'box-art',
  'thumbnail', 'thumb', 'poster', 'banner',
  'library_600x900', 'library_hero', 'header',
  'icon', 'logo', 'artwork', 'art',
  'cover_art', 'coverart', 'folder',
];

const MAX_COVER_SIZE = 5 * 1024 * 1024; // 5 MB max

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeMap = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.png': 'image/png', '.webp': 'image/webp',
    '.bmp': 'image/bmp',
  };
  return mimeMap[ext] || 'image/jpeg';
}

/**
 * Search Steam's library cache for a game's cover image.
 * Steam stores images as: {appid}_{hash}_{type}.{ext}
 * We look for: header (460x215), library_600x900 (portrait), library_hero (wide)
 */
function findSteamCover(appId) {
  const steamPath = getSteamPath();
  if (!steamPath) return null;

  const cacheDir = path.join(steamPath, 'appcache', 'librarycache');
  if (!fs.existsSync(cacheDir)) return null;

  try {
    const files = fs.readdirSync(cacheDir);
    // Priority order: library_600x900 (portrait cover) > header (landscape) > library_hero
    const priorities = ['library_600x900', 'header', 'library_hero', 'logo'];
    for (const prio of priorities) {
      const match = files.find(
        (f) =>
          f.startsWith(`${appId}_`) &&
          f.includes(`_${prio}`) &&
          IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase())
      );
      if (match) {
        const fullPath = path.join(cacheDir, match);
        try {
          const stats = fs.statSync(fullPath);
          if (stats.size <= MAX_COVER_SIZE) return fullPath;
        } catch (e) { /* skip */ }
      }
    }
    // Fallback: any image matching the appid
    const anyMatch = files.find(
      (f) =>
        f.startsWith(`${appId}_`) &&
        IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase())
    );
    if (anyMatch) {
      const fullPath = path.join(cacheDir, anyMatch);
      try {
        const stats = fs.statSync(fullPath);
        if (stats.size <= MAX_COVER_SIZE) return fullPath;
      } catch (e) { /* skip */ }
    }
  } catch (e) { /* skip */ }

  return null;
}

/**
 * Search a game's install directory for cover-like image files.
 * Checks common filenames first, then falls back to any reasonably-sized image.
 */
function findCoverInDirectory(installPath) {
  if (!installPath || !fs.existsSync(installPath)) return null;

  try {
    const entries = fs.readdirSync(installPath, { withFileTypes: true });

    // Pass 1: Match common cover filenames (exact or startsWith)
    for (const target of COVER_FILENAMES) {
      const match = entries.find((e) => {
        if (!e.isFile()) return false;
        const name = path.basename(e.name, path.extname(e.name)).toLowerCase();
        const ext = path.extname(e.name).toLowerCase();
        return (name === target || name.startsWith(target + '_') || name.startsWith(target + '-')) && IMAGE_EXTENSIONS.has(ext);
      });
      if (match) {
        const fullPath = path.join(installPath, match.name);
        try {
          const stats = fs.statSync(fullPath);
          if (stats.size <= MAX_COVER_SIZE) return fullPath;
        } catch (e) { /* skip */ }
      }
    }

    // Pass 2: Any image file at root level that looks reasonable (>10KB, <5MB)
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (!IMAGE_EXTENSIONS.has(ext)) continue;
      try {
        const stats = fs.statSync(path.join(installPath, entry.name));
        if (stats.size > 10 * 1024 && stats.size <= MAX_COVER_SIZE) {
          return path.join(installPath, entry.name);
        }
      } catch (e) { /* skip */ }
    }

    // Pass 3: Check common subdirectories (e.g. "art", "media", "images")
    const artDirs = ['art', 'media', 'images', 'assets', 'textures'];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (!artDirs.includes(entry.name.toLowerCase())) continue;
      const subDirPath = path.join(installPath, entry.name);
      try {
        const subEntries = fs.readdirSync(subDirPath, { withFileTypes: true });
        for (const sub of subEntries) {
          if (!sub.isFile()) continue;
          const ext = path.extname(sub.name).toLowerCase();
          if (!IMAGE_EXTENSIONS.has(ext)) continue;
          try {
            const stats = fs.statSync(path.join(subDirPath, sub.name));
            if (stats.size > 10 * 1024 && stats.size <= MAX_COVER_SIZE) {
              return path.join(subDirPath, sub.name);
            }
          } catch (e) { /* skip */ }
        }
      } catch (e) { /* skip */ }
    }
  } catch (e) { /* skip */ }

  return null;
}

/**
 * Read an image file and return a base64 data URL.
 */
function imageToDataUrl(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const mime = getMimeType(filePath);
    const base64 = buffer.toString('base64');
    return `data:${mime};base64,${base64}`;
  } catch (e) {
    return null;
  }
}

ipcMain.handle('games:cover', async (_, game) => {
  // Check cache first
  if (game.id && coverCache[game.id]) {
    return coverCache[game.id];
  }

  // If the DB already has a saved cover URL, use it directly
  if (game.id) {
    const saved = db.getGame(game.id);
    if (saved?.cover_image) {
      coverCache[game.id] = saved.cover_image;
      return saved.cover_image;
    }
  }

  let coverPath = null;
  let appId = game.app_id || null;

  // Strategy 1: Steam library cache (by app_id)
  if (game.platform === 'steam' && appId) {
    coverPath = findSteamCover(appId);
  }

  // Strategy 2: Search install directory for cover images
  if (!coverPath) {
    coverPath = findCoverInDirectory(game.install_path);
  }

  let coverUrl = null;

  if (coverPath) {
    coverUrl = imageToDataUrl(coverPath);
  }

  // Strategy 3: Steam CDN fallback — download as data URL
  // (Direct HTTP URLs are blocked by Electron's renderer CSP)
  if (!coverUrl && game.platform === 'steam' && appId) {
    coverUrl = await downloadImage(
      `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`
    );
  }

  // Strategy 4: For non-Steam games, search Steam by game name
  if (!coverUrl && game.platform !== 'steam' && game.title) {
    const foundAppId = findSteamAppIdByName(game.title);
    if (foundAppId) {
      coverUrl = await downloadImage(
        `https://cdn.cloudflare.steamstatic.com/steam/apps/${foundAppId}/header.jpg`
      );
    }
  }

  // Persist to DB & memory cache so we don't need to re-resolve next time
  if (coverUrl && game.id) {
    coverCache[game.id] = coverUrl;
    try {
      const existing = db.getGame(game.id);
      if (existing && !existing.cover_image) {
        db.saveGame({ ...existing, cover_image: coverUrl });
      }
    } catch (e) {
      console.warn('Cover save error:', e.message);
    }
  }

  return coverUrl;
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

  // ── Steam ───────────────────────────────────────────────
  if (platform === 'steam') {
    try {
      const steamPath = getSteamPath();
      if (!steamPath) return games;

      // Known non-game Steam AppIDs (tools, runtimes, compatibility layers)
      const nonGameAppIds = new Set([
        '228980',  // Steamworks Common Redistributables
        '1070560', // Steam Linux Runtime - soldier
        '1391110', // Steam Linux Runtime - sniper
        '1628350', // Steam Linux Runtime - scout
        '1826330', // Proton EasyAntiCheat Runtime
        '1161040', // Proton BattlEye Runtime
        '223026',  // Steamworks Common Redistributables (alt)
        '250820',  // SteamVR
        '323180',  // Steam Controller Configs
      ]);

      // Keywords in game names that indicate non-game entries
      const nonGameNamePatterns = [
        /redistributable/i, /proton\s/i, /steamworks/i,
        /steamvr/i, /steam\s+remote/i, /steam\s+link/i,
        /steam\s+runtime/i, /steam\s+linux/i,
        /shader\s+cache/i, /directx\s+runtime/i,
        /easyanticheat/i, /battleye/i,
      ];

      const vdfPath = path.join(steamPath, 'steamapps', 'libraryfolders.vdf');
      if (fs.existsSync(vdfPath)) {
        const vdfContent = fs.readFileSync(vdfPath, 'utf-8');

        // Robust VDF path extraction with capture group
        const pathRegex = /"path"\s+"([^"]+)"/g;
        let pathMatch;

        while ((pathMatch = pathRegex.exec(vdfContent)) !== null) {
          // VDF uses \\ for backslash in Windows paths → convert to single \
          const libPath = pathMatch[1].replace(/\\\\/g, '\\');
          const appsDir = path.join(libPath, 'steamapps');

          if (!fs.existsSync(appsDir)) continue;

          const files = fs.readdirSync(appsDir);
          for (const file of files) {
            if (!file.startsWith('appmanifest_') || !file.endsWith('.acf')) continue;

            try {
              const manifest = fs.readFileSync(path.join(appsDir, file), 'utf-8');

              const nameMatch = manifest.match(/"name"\s+"([^"]+)"/);
              const appIdMatch = manifest.match(/"appid"\s+"([^"]+)"/);
              const installDirMatch = manifest.match(/"installdir"\s+"([^"]+)"/);
              const launcherPathMatch = manifest.match(/"LauncherPath"\s+"([^"]+)"/);

              if (!nameMatch || !appIdMatch) continue;

              const name = nameMatch[1];
              const appId = appIdMatch[1];

              // Skip known non-game entries by AppID
              if (nonGameAppIds.has(appId)) continue;
              // Skip by name pattern
              if (nonGameNamePatterns.some((re) => re.test(name))) continue;

              // Resolve install path
              let installPath = null;
              if (installDirMatch) {
                installPath = path.join(appsDir, 'common', installDirMatch[1]);
              }

              // Check if game files actually exist on disk
              const isInstalled = installPath && fs.existsSync(installPath);

              // Find game executable
              let exePath = null;
              if (isInstalled) {
                // Try LauncherPath from the manifest first
                if (launcherPathMatch) {
                  const lp = launcherPathMatch[1]
                    .replace(/\\\\/g, '\\')
                    .replace(/"/g, '');
                  if (lp && lp.endsWith('.exe')) {
                    // LauncherPath may be relative to install dir or absolute
                    const fullPath = path.isAbsolute(lp)
                      ? lp
                      : path.join(installPath, lp);
                    if (fs.existsSync(fullPath)) {
                      exePath = fullPath;
                    }
                  }
                }
                // Fallback: search the install directory for game exe
                if (!exePath) {
                  exePath = findExeInDir(installPath, 3);
                }
              }

              games.push({
                title: name,
                platform: 'steam',
                app_id: appId,
                install_path: installPath,
                exe_path: exePath,
                status: isInstalled ? 'installed' : 'missing',
              });
            } catch (e) {
              // skip malformed manifests
            }
          }
        }
      }
    } catch (e) {
      console.error('Steam scan error:', e);
    }
  }

  // ── Epic Games ──────────────────────────────────────────
  if (platform === 'epic') {
    try {
      const epicPath = getEpicPath();
      if (!epicPath) return games;

      // Known non-game Epic manifest identifiers
      const nonGameAppNames = [
        'UE_5', 'UE_4', 'UnrealEngine', 'Fortnite_Clash',
        'EpicGamesLauncher', 'EpicOnlineServices', 'EOSInstaller',
        'Twinmotion', 'MetaHuman', 'QuixelBridge', 'RealityScan',
      ];
      const nonGameTitleKeywords = [
        /unreal engine/i, /epic games/i, /epic online services/i,
        /twinmotion/i, /metahuman/i, /quixel/i, /realityscan/i,
      ];

      const files = fs.readdirSync(epicPath);
      for (const file of files) {
        if (!file.endsWith('.item')) continue;
        try {
          const manifest = fs.readFileSync(path.join(epicPath, file), 'utf-8');
          const json = JSON.parse(manifest);
          const name = json.DisplayName || json.AppName;
          if (!name) continue;

          // Skip non-game items (game engines, launcher, tools)
          const appName = json.AppName || '';
          if (nonGameAppNames.some(ng => appName.startsWith(ng))) continue;
          if (nonGameTitleKeywords.some(re => re.test(name))) continue;
          if (json.MainGameAppName) continue; // DLC or add-on content

          const installPath = json.InstallLocation || null;
          let exePath = null;
          const isInstalled = installPath && fs.existsSync(installPath);

          // Find the game executable in the install directory
          if (isInstalled) {
            exePath = findExeInDir(installPath, 3);
          }

          games.push({
            title: name,
            platform: 'epic',
            app_id: json.CatalogItemId || json.AppName,
            install_path: installPath,
            exe_path: exePath,
            status: isInstalled ? 'installed' : 'missing',
          });
        } catch (e) {
          // skip malformed manifests
        }
      }
    } catch (e) {
      console.error('Epic scan error:', e);
    }
  }

  // ── Xbox / Microsoft Store ──────────────────────────────
  if (platform === 'xbox') {
    try {
      const xboxPaths = getXboxPaths();
      const { execSync } = require('child_process');

      // Strategy: cross-reference XboxGames folders with AppX package metadata
      // to get proper display names instead of mangled package folder names.
      let xboxPkgMap = {};
      try {
        const psResult = execSync(
          'powershell -NoProfile -Command "' +
          "Get-AppxPackage | Where-Object { " +
          "$_.Publisher -like '*Microsoft*' -or $_.Publisher -like '*Xbox*' -or " +
          "$_.Name -like '*Microsoft.Gaming*' -or $_.Name -like '*GamePass*' " +
          "} | Select-Object Name, InstallLocation | ConvertTo-Json -Compress" +
          '"',
          { encoding: 'utf-8', timeout: 15000, maxBuffer: 5 * 1024 * 1024 }
        );
        if (psResult && psResult.trim()) {
          const pkgs = JSON.parse(psResult);
          (Array.isArray(pkgs) ? pkgs : [pkgs]).forEach((pkg) => {
            if (pkg.Name && pkg.InstallLocation) {
              // Map by folder name → display info
              xboxPkgMap[path.basename(pkg.InstallLocation)] = {
                name: pkg.Name,
                installPath: pkg.InstallLocation,
              };
            }
          });
        }
      } catch (e) {
        // AppX query failed, will fall back to folder names
      }

      // Also try to get display names from the Uninstall registry
      let xboxRegMap = {};
      try {
        const regPaths = [
          'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
          'HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
          'HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
        ];
        const regCmd =
          regPaths.map((rp) => `Get-ChildItem '${rp}' -ErrorAction SilentlyContinue`).join(',') +
          ` | ForEach-Object { Get-ItemProperty $_.PsPath }` +
          ` | Where-Object { $_.DisplayName }` +
          ` | Select-Object DisplayName, InstallLocation, PSChildName` +
          ` | ConvertTo-Json -Compress`;
        const regResult = execSync(
          `powershell -NoProfile -Command "${regCmd.replace(/"/g, '\\"')}"`,
          { encoding: 'utf-8', timeout: 15000, maxBuffer: 5 * 1024 * 1024 }
        );
        if (regResult && regResult.trim()) {
          const regItems = JSON.parse(regResult);
          (Array.isArray(regItems) ? regItems : [regItems]).forEach((item) => {
            if (item.InstallLocation) {
              const folderName = path.basename(
                item.InstallLocation.replace(/[\\/]$/, '')
              );
              xboxRegMap[folderName] = item.DisplayName;
              xboxRegMap[item.InstallLocation] = item.DisplayName;
            }
          });
        }
      } catch (e) {
        // Registry query failed
      }

      for (const xboxPath of xboxPaths) {
        if (!fs.existsSync(xboxPath)) continue;
        const entries = fs.readdirSync(xboxPath, { withFileTypes: true });

        for (const entry of entries) {
          if (!entry.isDirectory()) continue;
          const gameFolderPath = path.join(xboxPath, entry.name);

          try {
            // Xbox game folder may be the install root directly,
            // or contain a subfolder with the actual game files.
            let installPath = gameFolderPath;
            const subEntries = fs.readdirSync(gameFolderPath, { withFileTypes: true });
            const contentDir = subEntries.find(
              (e) => e.isDirectory() && e.name === 'Content'
            );

            // If there's a Content/ subfolder, game data is inside it
            if (contentDir) {
              installPath = path.join(gameFolderPath, 'Content');
            }

            // Try multiple sources for the proper game name
            let title = null;

            // 1. Check Uninstall registry by install path
            title = xboxRegMap[installPath] || xboxRegMap[gameFolderPath];

            // 2. Check AppX package metadata by folder name
            if (!title) {
              const pkgInfo =
                xboxPkgMap[entry.name] ||
                xboxPkgMap[path.basename(installPath)];
              if (pkgInfo && pkgInfo.name) {
                // Clean up package name: Microsoft.GameName_8wekyb3d8bbwe → GameName
                title = pkgInfo.name
                  .replace(/^Microsoft\./, '')
                  .replace(/_[a-z0-9]+$/i, '')
                  .replace(/([a-z])([A-Z])/g, '$1 $2');
              }
            }

            // 3. Check registry by Content subfolder name
            if (!title && contentDir) {
              const contentSubs = fs.readdirSync(installPath, {
                withFileTypes: true,
              });
              for (const sub of contentSubs) {
                if (sub.isDirectory() && xboxRegMap[sub.name]) {
                  title = xboxRegMap[sub.name];
                  break;
                }
              }
            }

            // 4. Fall back to cleaned folder name
            if (!title) {
              title = entry.name
                .replace(/^Microsoft\./, '')
                .replace(/_[a-z0-9]+$/i, '')
                .replace(/[_-]/g, ' ')
                .replace(/([a-z])([A-Z])/g, '$1 $2')
                .trim();
            }

            const exePath = findExeInDir(installPath, 3);
            const hasExe = !!exePath;

            games.push({
              title,
              platform: 'xbox',
              install_path: installPath,
              exe_path: exePath,
              status: hasExe ? 'installed' : 'missing',
            });
          } catch (e) {
            // skip inaccessible directories
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

// Patterns for non-game executables that should be excluded
const EXE_EXCLUDE_PATTERNS = [
  /unins/i, /setup/i, /install/i, /update/i, /updater/i,
  /redist/i, /dotnet/i, /vc_redist/i, /dxsetup/i,
  /crash/i, /reporter/i, /bugreport/i, /diag/i,
  /config/i, /settings/i, /option/i, /tool/i, /editor/i,
  /server(?!.*game)/i, /dedicated/i, /anticheat/i, /eac_launcher/i,
  /battleye/i, /prerequisite/i,
  /helper/i, /service/i, /daemon/i,
  /patcher/i, /bootstrap/i,
];

// Directory names to skip when searching for game executables
const SKIP_EXE_DIRS = new Set([
  'redist', 'prerequisites', 'crashreporter', 'crash_reporter',
  'anticheat', 'eac', 'battleye', 'directx', 'dotnet',
  'support', 'redistributables', '__installer', 'installer',
]);

function findExeInDir(dirPath, maxDepth) {
  const candidates = [];

  function collect(currentPath, depth) {
    if (depth < 0) return;
    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        if (entry.isFile() && entry.name.endsWith('.exe')) {
          if (!EXE_EXCLUDE_PATTERNS.some((p) => p.test(entry.name))) {
            candidates.push(fullPath);
          }
        } else if (
          entry.isDirectory() &&
          !SKIP_EXE_DIRS.has(entry.name.toLowerCase())
        ) {
          collect(fullPath, depth - 1);
        }
      }
    } catch (e) {
      // skip inaccessible
    }
  }

  collect(dirPath, maxDepth);
  // Return the first candidate (closest to root, most likely the game exe)
  return candidates.length > 0 ? candidates[0] : null;
}

// ─── Manual Path Scan: Game Detection ─────────────────────────
//
// Three-layer detection strategy for manual directory scanning:
//   1. Game engine signatures  → highest confidence (immediate match)
//   2. Executable + resources  → high confidence (exe + large data files)
//   3. Executable + dir name   → medium confidence (fallback)
//   Only exe, no signals       → low confidence (likely not a game)

// Game engine signature files — presence of any = high confidence this is a game
const GAME_ENGINE_SIGNATURES = [
  { files: ['unityplayer.dll'], engine: 'Unity' },
  { files: ['gameinfo.gi'], engine: 'Source' },
  { files: ['gameinfo.txt'], engine: 'Source (legacy)' },
  { files: ['data.win'], engine: 'GameMaker' },
  { files: ['options.ini', 'data.win'], engine: 'GameMaker' },
  { files: ['nw.dll', 'nw.pak'], engine: 'NW.js' },
  { files: ['nw.exe', 'nw.pak'], engine: 'NW.js' },
  { files: ['package.nw', 'nw.dll'], engine: 'NW.js' },
  { files: ['Construct2', 'c2runtime.js'], engine: 'Construct' },
  { files: ['game.unx'], engine: 'FNA' },
  { files: ['fna.dll'], engine: 'FNA' },
  { files: ['rpg_rt.exe'], engine: 'RPG Maker' },
  { files: ['game.rgss3a'], engine: 'RPG Maker VX Ace' },
  { files: ['game.rgss2a'], engine: 'RPG Maker VX' },
  { files: ['game.rgssa'], engine: 'RPG Maker XP' },
  { files: ['dosbox.exe', 'dosbox.conf'], engine: 'DOSBox' },
  { files: ['dosbox.exe', '.dosbox.conf'], engine: 'DOSBox' },
  { files: ['scummvm.exe'], engine: 'ScummVM' },
];

// Directory names containing these indicate a game (case-insensitive)
const ENGINE_DIR_HINTS = [
  { dir: 'unrealengine', hint: 'UnrealEngine', needExe: true },
  { dir: 'engine', hint: 'UnrealEngine', needExe: true,
    also: ['binaries', 'content'] },
];

// Resource/data file extensions typical of games (strict list, no ambiguous types)
const GAME_DATA_EXTENSIONS = new Set([
  '.pak', '.vpk', '.pk3', '.pk4', '.pk6', '.pk7',
  '.wad', '.bsp', '.nav',
  '.forge', '.cpk', '.afs', '.p5r',
  '.obb', '.xapk',
]);

// Directories that should be skipped entirely during manual scanning
const MANUAL_SKIP_DIRS = new Set([
  'redist', 'prerequisites', 'crashreporter', 'crash_reporter',
  'anticheat', 'eac', 'battleye', 'directx', 'dotnet',
  'support', 'redistributables', '__installer', 'installer',
  'commonredist', '_commonredist', 'steam_api', 'steamworks',
  'physx', 'uplay', 'ubisoft', 'origin', 'gog galaxy',
  'gog games', 'galaxyclient',
  // System / runtime / SDK directories
  'sdk', 'tools', 'toolkit', 'debug', 'dev', 'development',
  'bin', 'bin32', 'bin64', 'syswow64', 'system32',
  'runtime', 'framework', 'lib', 'libs', 'libraries',
  'cache', 'temp', 'tmp', 'logs', 'log',
  'docs', 'documentation', 'samples', 'examples',
  'plugins', 'addons', 'mods', 'shaders',
  'localization', 'locale', 'locales',
]);

// Directory name patterns that indicate non-game directories
const MANUAL_DIR_EXCLUDE_PATTERNS = [
  /^__/i, /^\./, /^\$/,
  /^\.git$/i, /^\.svn$/i, /^node_modules$/i,
  /^__pycache__$/i, /\.egg-info$/i,
  // Windows system components often mistaken for games
  /^WindowsApps$/i, /^Windows\.old$/i,
  /^GameBar$/i, /^GameDVR$/i, /^GameOverlay$/i,
  /^GameMonitor$/i, /^GameLauncher$/i,
  // Common non-game directories
  /^Program\s?Files/i, /^ProgramData$/i,
  /^Microsoft/i, /^Intel$/i, /^AMD$/i, /^NVIDIA$/i,
  /^Steam$/i, /^Epic\s?Games/i, /^XboxGames$/i,
  /^Python/i, /^Java/i, /^Jenkins/i,
  /^Visual\s?Studio/i, /^VSCode/i,
];

// Directory name patterns suggesting a game context (boosts confidence)
const GAME_DIR_KEYWORDS = [
  /^games?$/i,  // Only exact match "game" or "games", not substring
];

// Minimum exe file size to consider it a game (5 MB)
const MIN_GAME_EXE_SIZE = 5 * 1024 * 1024;

// Minimum resource file size to count as game data (100 MB)
const MIN_RESOURCE_SIZE = 100 * 1024 * 1024;

/**
 * Check if a directory is a "game container" — a parent folder that holds
 * multiple individual game directories rather than being a single game itself.
 * Returns true when ≥ 2 non-skipped subdirectories each contain an exe at
 * their root level.  Example: D:\game\ containing 007 First Light\, Starfield\,
 * WoLongFallenDynasty\ — each with its own exe.
 */
function isGameContainer(dirEntries, dirPath) {
  let gameLikeCount = 0;
  for (const entry of dirEntries) {
    if (!entry.isDirectory()) continue;
    if (MANUAL_SKIP_DIRS.has(entry.name.toLowerCase())) continue;
    if (MANUAL_DIR_EXCLUDE_PATTERNS.some((p) => p.test(entry.name))) continue;

    const subPath = path.join(dirPath, entry.name);
    try {
      const subEntries = fs.readdirSync(subPath, { withFileTypes: true });
      const hasExe = subEntries.some((e) => e.isFile() && e.name.endsWith('.exe'));
      if (hasExe) {
        gameLikeCount++;
        if (gameLikeCount >= 2) return true; // early exit — clearly a container
      }
    } catch (_) { /* skip inaccessible */ }
  }
  return false;
}

/**
 * Detect if a directory contains a known game engine's signature files.
 * Returns { engine, files } or null.
 */
function detectGameEngine(dirEntries, dirPath) {
  const entryNames = new Set(dirEntries.map((e) => e.name));
  const entryNameLower = new Set(dirEntries.map((e) => e.name.toLowerCase()));

  // Check file-based signatures
  for (const sig of GAME_ENGINE_SIGNATURES) {
    if (sig.files.every((f) => entryNameLower.has(f.toLowerCase()))) {
      return { engine: sig.engine, files: sig.files };
    }
  }

  // Check directory-structure hints (e.g. Unreal Engine layout)
  for (const hint of ENGINE_DIR_HINTS) {
    const hasDir = dirEntries.some(
      (e) =>
        e.isDirectory() &&
        e.name.toLowerCase().includes(hint.dir.toLowerCase())
    );
    if (hasDir) {
      if (hint.needExe) {
        const hasExe = dirEntries.some(
          (e) => e.isFile() && e.name.endsWith('.exe')
        );
        if (!hasExe) continue;
      }
      // Additional required subdirectories (e.g. Binaries + Content for UE)
      if (hint.also) {
        const subDirNames = dirEntries
          .filter((e) => e.isDirectory())
          .map((e) => e.name.toLowerCase());
        const hasAll = hint.also.every((req) =>
          subDirNames.some((d) => d.includes(req.toLowerCase()))
        );
        if (!hasAll) continue;
      }
      return { engine: hint.hint, files: [] };
    }
  }

  // Source engine: hl2.exe or game-specific exe + sourceengine/ subdir
  if (entryNames.has('hl2.exe') || entryNames.has('hl.exe')) {
    return { engine: 'Source', files: [] };
  }

  // CryEngine: requires specific directory layout (Engine/ + Bin64/ or Game/ + .pak)
  if (
    entryNames.has('cryengine.dll') ||
    (entryNames.has('cry3dengine.dll') &&
     dirEntries.some((e) => e.isFile() && e.name.endsWith('.exe')))
  ) {
    return { engine: 'CryEngine', files: [] };
  }

  // Godot: .pck file + .exe in same directory
  if (
    dirEntries.some((e) => e.isFile() && e.name.endsWith('.pck')) &&
    dirEntries.some((e) => e.isFile() && e.name.endsWith('.exe'))
  ) {
    return { engine: 'Godot', files: [] };
  }

  // Ren'Py: renpy/ directory + lib/ + .exe
  if (
    entryNameLower.has('renpy') &&
    entryNameLower.has('lib') &&
    dirEntries.some((e) => e.isFile() && e.name.endsWith('.exe'))
  ) {
    return { engine: "Ren'Py", files: [] };
  }

  // GOG game: goggame-*.info + gog.ico
  if (
    dirEntries.some((e) => e.isFile() && /^goggame-.*\.info$/i.test(e.name))
  ) {
    return { engine: 'GOG', files: [] };
  }

  return null;
}

/**
 * Find a game executable in a directory, filtering out tools.
 * Does NOT recurse into known utility directories.
 * Returns the full path to the best exe candidate, or null.
 */
function findGameExe(dirPath) {
  const candidates = [];

  function collect(currentPath, depth) {
    if (depth < 0) return;
    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        if (entry.isFile() && entry.name.endsWith('.exe')) {
          // Skip utility exes by name pattern
          if (EXE_EXCLUDE_PATTERNS.some((p) => p.test(entry.name))) continue;
          // Skip tiny executables (helpers, launchers, stubs < 5 MB)
          try {
            const stats = fs.statSync(fullPath);
            if (stats.size < MIN_GAME_EXE_SIZE) continue;
          } catch (e) { continue; }
          candidates.push(fullPath);
        } else if (
          entry.isDirectory() &&
          !SKIP_EXE_DIRS.has(entry.name.toLowerCase())
        ) {
          collect(fullPath, depth - 1);
        }
      }
    } catch (e) {
      // skip inaccessible
    }
  }

  collect(dirPath, 3);
  return candidates.length > 0 ? candidates[0] : null;
}

/**
 * Check if a directory contains large game resource/data files (>100 MB).
 * Returns the total size of matching files, or 0.
 */
function checkGameResources(dirEntries, dirPath) {
  let totalSize = 0;
  for (const entry of dirEntries) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!GAME_DATA_EXTENSIONS.has(ext)) continue;
    if (EXE_EXCLUDE_PATTERNS.some((p) => p.test(entry.name))) continue;
    try {
      const stats = fs.statSync(path.join(dirPath, entry.name));
      if (stats.size > MIN_RESOURCE_SIZE) {
        totalSize += stats.size;
      }
    } catch (e) {
      // skip
    }
  }
  return totalSize;
}

/**
 * Scan a user-specified directory for games.
 *
 * Uses a strict two-layer detection system:
 *   - Layer 1: Game engine signature detected (high confidence)
 *   - Layer 2: Executable (>5MB) + large game resource files (>100MB)
 *
 * Only high-confidence matches are reported. Everything else is recursed into.
 * Confirmed game directories are NOT recursed into,
 * preventing nested tool subdirectories from appearing as separate games.
 */
function scanDirectory(dirPath, maxDepth = 5) {
  const games = [];

  function scan(currentPath, depth) {
    if (depth > maxDepth) return;
    try {
      if (!fs.existsSync(currentPath)) return;

      const entries = fs.readdirSync(currentPath, { withFileTypes: true });
      const subDirs = [];

      for (const entry of entries) {
        if (entry.isDirectory()) subDirs.push(entry);
      }

      // ── Layer 1: Engine detection ─────────────────────────
      const engine = detectGameEngine(entries, currentPath);
      if (engine) {
        const exePath = findGameExe(currentPath);
        games.push({
          title: path.basename(currentPath).replace(/[_-]/g, ' '),
          exe_path: exePath,
          install_path: currentPath,
          platform: 'manual',
          engine: engine.engine,
          status: 'installed',
          confidence: 'high',
        });
        return; // confirmed game — don't recurse into children
      }

      // ── Layer 2: Exe + large resource files ────────────
      const exePath = findGameExe(currentPath);
      if (exePath) {
        const resourceSize = checkGameResources(entries, currentPath);
        const hasResources = resourceSize > 0;

        // Guard: if this directory is a container holding multiple game
        // subdirectories, do NOT claim it as a single game — recurse instead.
        const isContainer = isGameContainer(entries, currentPath);

        if (hasResources && !isContainer) {
          // High-confidence: exe + large game resource files
          games.push({
            title: path.basename(currentPath).replace(/[_-]/g, ' '),
            exe_path: exePath,
            install_path: currentPath,
            platform: 'manual',
            status: 'installed',
            confidence: 'high',
          });
          return; // confirmed game — don't recurse into children
        }

        // ── Layer 3: Exe only (medium confidence fallback) ──
        // For manually selected directories, a non-trivial exe alone is a
        // reasonable signal.  Many games (especially indie / older titles)
        // do not ship with the specific resource formats checked by Layer 2.
        // Container directories are excluded — they should recurse instead.
        if (!isContainer) {
          try {
            const exeStats = fs.statSync(exePath);
            if (exeStats.size >= MIN_GAME_EXE_SIZE) {
              games.push({
                title: path.basename(currentPath).replace(/[_-]/g, ' '),
                exe_path: exePath,
                install_path: currentPath,
                platform: 'manual',
                status: 'installed',
                confidence: 'medium',
              });
              return; // accepted as game — don't recurse into children
            }
          } catch (_) { /* skip */ }
        }
      }

      // Not a confirmed game — recurse into subdirectories
      for (const subDir of subDirs) {
        const name = subDir.name;
        // Skip known utility and system directories
        if (MANUAL_SKIP_DIRS.has(name.toLowerCase())) continue;
        if (MANUAL_DIR_EXCLUDE_PATTERNS.some((p) => p.test(name))) continue;
        scan(path.join(currentPath, name), depth + 1);
      }
    } catch (e) {
      // skip inaccessible directories
    }
  }

  scan(dirPath, 0);
  return games;
}
