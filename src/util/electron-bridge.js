/**
 * Electron Bridge - Renderer Process API
 * Provides native window, menu, and file system access to React frontend
 */

const electronAPI = {
  // Window control methods
  minimizeWindow: async () => {
    return new Promise((resolve) => {
      if (electronAPI.onMinimize) {
        electronAPI.onMinimize();
      } else if (window.electron?.ipcRenderer) {
        window.electron.ipcRenderer.send('minimize-window');
        window.electron.ipcRenderer.once('minimize-window-reply', resolve);
      } else {
        window.opener?.postMessage({ type: 'MINIMIZE_WINDOW' }, '*');
        resolve();
      }
    });
  },

  maximizeWindow: async () => {
    return new Promise((resolve) => {
      if (electronAPI.onMaximize) {
        electronAPI.onMaximize();
      } else if (window.electron?.ipcRenderer) {
        window.electron.ipcRenderer.send('maximize-window');
        window.electron.ipcRenderer.once('maximize-window-reply', resolve);
      } else {
        resolve();
      }
    });
  },

  toggleMaximaze: async () => {
    return new Promise((resolve) => {
      if (electronAPI.onToggleMaximize) {
        electronAPI.onToggleMaximize();
      } else if (window.electron?.ipcRenderer) {
        window.electron.ipcRenderer.send('toggle-maximize');
        window.electron.ipcRenderer.once('toggle-maximize-reply', resolve);
      } else {
        resolve();
      }
    });
  },

  closeWindow: async () => window.close(),

  getPlatform: async () => {
    const platform = process.platform || (navigator.userAgent.match(/Windows/i) ? 'windows' : 'macos');
    return platform;
  },

  openDevTools: async () => {},

  // Native system methods
  openExternal: async (url) => {
    shell.openExternal(url);
  },

  showItemInFolder: async (filePath) => {
    shell.showItemInFolder(filePath);
  },
};

// Event listeners for custom actions
window.addEventListener('message', (event) => {
  if (!event.data || event.data.type !== 'ELECTRON_API') return;

  const action = event.data.action;
  if (electronAPI[action]) {
    electronAPI[action](...event.data.args);
  }
});

export default electronAPI;
