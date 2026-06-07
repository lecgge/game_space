import { ipcRenderer } from 'electron';

// Electron API exposed to renderer process
const api = {
  // Window control
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  toggleMaximize: () => ipcRenderer.send('toggle-maximate'),
  
  // Theme management
  toggleTheme: (theme) => ipcRenderer.send('toggle-theme', theme),
  
  // IPC event listeners
  onOpenDevTools: () => {
    window.electronAPI.onOpenDevTools?.({ show: true });
  },
  
  onCloseDevTools: () => {
    window.electronAPI.onCloseDevTools?.({ show: false });
  },
};

// Initialize platform detection (will be replaced by main process)
let currentPlatform = null;
window.electronAPI = {
  // Platform info
  getPlatform: () => {
    return navigator.userAgent.includes('Darwin') ? 'darwin' : 
           navigator.userAgent.includes('Windows') ? 'win32' : 
           navigator.userAgent.includes('X11') || navigator.userAgent.includes('Linux') 
           ? 'linux' : null;
  },
  
  // Window control methods
  minimizeWindow: () => api.minimizeWindow(),
  maximizeWindow: () => api.maximizeWindow(),
  closeWindow: () => api.closeWindow(),
  toggleMaximate: () => api.toggleMaximize(),
  
  // Theme management
  toggleTheme: (theme) => api.toggleTheme(theme),
};

// Expose IPC event listeners to renderer
window.electronAPI.onOpenDevTools = null;
window.electronAPI.onCloseDevTools = null;
