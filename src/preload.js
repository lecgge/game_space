import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Platform info
  getPlatformInfo: () => ipcRenderer.invoke('getPlatformInfo'),
  
  // Window management
  minimize: () => ipcRenderer.invoke('gameWindowManager', 'minimize'),
  maximize: () => ipcRenderer.invoke('gameWindowManager', 'maximize'),
  close: () => ipcRenderer.invoke('gameWindowManager', 'close'),
  
  // System theme
  setSystemTheme: (theme) => ipcRenderer.invoke('setSystemTheme', theme),
  
  // Node communication
  rendererToNode: async () => {
    return new Promise((resolve, reject) => {
      ipcRenderer.on('node-response', (_, data) => {
        if (data.error) {
          reject(new Error(data.error));
        } else {
          resolve(data);
        }
      });
      
      try {
        const result = ipcRenderer.invoke('renderer-to-node');
        ipcRenderer.removeAllListeners('node-response');
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  },
  
  // IPC sender helper
  sendToMain: (channel, data = null) => {
    return new Promise((resolve, reject) => {
      const handler = (event, result) => {
        ipcRenderer.removeListener(channel, handler);
        if (result.error) {
          reject(new Error(result.error));
        } else {
          resolve(result);
        }
      };
      
      ipcRenderer.on(channel, handler);
      try {
        const arg = data !== null ? [channel, data] : [channel];
        ipcRenderer.send.apply(ipcRenderer, arg);
        setTimeout(() => resolve({ success: true }), 1000);
      } catch (error) {
        reject(error);
      }
    });
  },
  
  // System commands
  openFile: (path) => ipcRenderer.invoke('open-file', path),
  showFolder: (path) => ipcRenderer.invoke('show-folder', path),
  getFilesFromPath: async (path, options) => {
    return new Promise((resolve, reject) => {
      const handler = (event, data) => {
        ipcRenderer.removeListener('file-results', handler);
        resolve(data);
      };
      ipcRenderer.on('file-results', handler);
      
      try {
        ipcRenderer.send('get-files-from-path', path, options || {});
        setTimeout(() => resolve({ success: true, files: [] }), 500);
      } catch (error) {
        reject(error);
      }
    });
  },
  
  // Drag and drag start support
  onDragStart: (handler) => {
    const remove = (e) => handler('drag-start', e);
    ipcRenderer.on('on-drag-over', remove);
    return { destroy: () => ipcRenderer.removeListener('on-drag-over', remove) };
  },
  
  // App events
  onReadyToShow: (callback) => {
    ipcRenderer.on('ready-to-show', callback);
    return { destroy: () => ipcRenderer.removeAllListeners('ready-to-show') };
  },
  
  // Window state
  isMaximized: () => ipcRenderer.invoke('is-maximized'),
  
  // File operations
  copyFilesToPath: (files, targetDir) => ipcRenderer.invoke('copy-files-to-path', files, targetDir),
  moveFilesToPath: (files, targetDir) => ipcRenderer.invoke('move-files-to-path', files, targetDir),
  deleteAllFilesInPath: (targetDir) => ipcRenderer.invoke('delete-all-files-in-path', targetDir),
  
  searchFilesByType: (type, path, nameRegex) => 
    ipcRenderer.invoke('search-files-by-type', type, path, nameRegex),
  
  getFilePathById: (id) => ipcRenderer.invoke('get-filepath-by-id', id),
  
  // Library management
  importLibraryFromPath: (path) => ipcRenderer.invoke('import-library-from-path', path),
  addFilesToImportList: (paths, listId) => 
    ipcRenderer.invoke('add-files-to-import-list', paths, listId),
});
