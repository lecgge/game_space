const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window control
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  
  // Store operations
  getAllGames: async () => ipcRenderer.invoke('store/get-all'),
  saveGame: async (data) => ipcRenderer.invoke('store/save', data),
  deleteGames: async () => ipcRenderer.invoke('store/delete'),
});
