const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // ─── Window Controls ───────────────────────────────────────
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:is-maximized'),

  // ─── App Info ──────────────────────────────────────────────
  getPlatform: () => ipcRenderer.invoke('app:platform'),

  // ─── Games ─────────────────────────────────────────────────
  getAllGames: (filters) => ipcRenderer.invoke('games:get-all', filters),
  getGame: (id) => ipcRenderer.invoke('games:get', id),
  saveGame: (game) => ipcRenderer.invoke('games:save', game),
  deleteGame: (id) => ipcRenderer.invoke('games:delete', id),
  getStats: () => ipcRenderer.invoke('games:stats'),
  getRecentGames: (limit) => ipcRenderer.invoke('games:recent', limit),

  // ─── Scanning ──────────────────────────────────────────────
  scanPlatforms: () => ipcRenderer.invoke('scan:platforms'),
  scanPlatformGames: (platform) => ipcRenderer.invoke('scan:platform-games', platform),
  scanDirectory: (dirPath) => ipcRenderer.invoke('scan:directory', dirPath),

  // ─── Settings ──────────────────────────────────────────────
  getSetting: (key) => ipcRenderer.invoke('settings:get', key),
  setSetting: (key, value) => ipcRenderer.invoke('settings:set', key, value),
  getAllSettings: () => ipcRenderer.invoke('settings:get-all'),

  // ─── System / Dialogs ─────────────────────────────────────
  openDirectoryDialog: () => ipcRenderer.invoke('dialog:open-directory'),
  openPath: (p) => ipcRenderer.invoke('shell:open-path', p),
  showItemInFolder: (p) => ipcRenderer.invoke('shell:show-item', p),

  // ─── Events (Main → Renderer) ─────────────────────────────
  onMaximizeChange: (callback) => {
    const handler = (_, val) => callback(val);
    ipcRenderer.on('window:maximized-changed', handler);
    return () => ipcRenderer.removeListener('window:maximized-changed', handler);
  },
});
