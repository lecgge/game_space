/**
 * Electron Preload Script - Secure bridge between renderer and main process
 */

import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Platform information
  getPlatform: () => ipcRenderer.sendSync('get-platform'),
  
  // Window control
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
  
  // Theme management
  toggleTheme: (theme) => ipcRenderer.send('toggle-theme', theme),
  getTheme: () => ipcRenderer.invoke('get-theme'),
  
  // File system operations
  readDir: (path) => ipcRenderer.invoke('read-dir', path),
  readFile: (path) => ipcRenderer.invoke('read-file', path),
  writeContent: (path, content) => ipcRenderer.invoke('write-content', path, content),
  deleteFile: (path) => ipcRenderer.invoke('delete-file', path),
  
  // App information
  getAppVersion: () => ipcRenderer.sendSync('get-app-version'),
  getPath: (name) => ipcRenderer.invoke('get-path', name),
});
