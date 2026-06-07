// ELECTRON IPC WRAPPER - Handles Node-API interactions from React Renderer

class IPCWrapper {
  constructor() {
    this.registry = new Map();
    this.listeners = new Map();
    this.__IPCCallback__ = null;
  }

  // Register a new IPC channel handler
  add(channel, handler, shouldCatch = false) {
    if (!['object', 'function'].includes(typeof handler)) {
      throw new Error('Handler must be a function!');
    }
    
    const wrapped = (event, ...args) => {
      try {
        const result = handler(event, ...args);
        
        if (typeof result === 'object' && result !== null) {
          return Promise.resolve(result);
        }
        
        return result;
      } catch (error) {
        console.error(`IPC Error on channel "${channel}":`, error);
        
        if (!shouldCatch) {
          throw error;
        }
        
        return { error: error.message };
      }
    };

    ipcMain.on(channel, wrapped);
    this.registry.set(channel, { handler, wrapped });
    
    console.log(`IPC Channel registered: ${channel}`);
  }

  // Remove an IPC channel handler
  remove(channel) {
    if (this.registry.has(channel)) {
      ipcMain.removeListener(channel, this.registry.get(channel).wrapped);
      this.registry.delete(channel);
      console.log(`IPC Channel removed: ${channel}`);
    }
  }

  // Set callback for renderer to Node communication
  setCallback(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function!');
    }
    this.__IPCCallback__ = callback;
  }

  // Destroy all registries
  destroy() {
    [...this.registry.values()].forEach(({ wrapped }) => {
      ipcMain.off(wrapped);
    });
    this.registry.clear();
    console.log('IPC Wrapper destroyed');
  }
}

// Singleton instance
const IPCWrapperSingleton = new IPCWrapper();

// Export utility function for global access
window.getIPCHandler = (channel) => {
  return IPCWrapperSingleton.registry.get(channel);
};

ipcMain.on('renderer-request', (event, data) => {
  console.log('Renderer requested:', data);
  IPCWrapperSingleton.__IPCCallback__(data.data);
});
