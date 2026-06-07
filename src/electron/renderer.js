const { contextBridge, ipcRenderer } = electron;

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Store management
  getStore: async () => {
    try {
      const res = await fetch('/api/get-store');
      return await res.json();
    } catch (error) {
      console.error('Failed to fetch store:', error);
      return { games: [], totalGames: 0, categories: [], librarySize: 0 };
    }
  },
  saveGame: async (data) => {
    try {
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return true;
    } catch (error) {
      console.error('Save error:', error);
      throw new Error('Failed to save');
    }
  },
  
  // IPC methods
  onStoreUpdate: (callback) => {
    ipcRenderer.on('store-updated', (_event, data) => callback(data));
  },
});
