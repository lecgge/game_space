const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

function createWindow() {
  try {
    mainWindow = new BrowserWindow({
      width: 1440,
      height: 980,
      minWidth: 1280,
      minHeight: 768,
      backgroundColor: '#0a0c15',
      titleBarStyle: 'hidden',
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: __filename.startsWith('C:') ? path.join(__dirname, '..', 'src', 'preload.js') : path.join(__dirname, 'preload.js'),
        devTools: process.env.NODE_ENV !== 'production'
      },
      frame: true,
      title: 'GameSpace - Premium Gaming Platform',
      icon: path.resolve(__dirname, '../resources/icon.png')
    });

    if (process.env.NODE_ENV === 'development') {
      mainWindow.loadURL('http://localhost:3000');
      mainWindow.webContents.openDevTools();
      
      mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.once('ready-to-show', () => mainWindow.show());
      });
    } else {
      const filePath = path.join(__dirname, 'dist/index.html');
      mainWindow.loadFile(filePath);
    }

    mainWindow.on('ready-to-show', () => {
      mainWindow.show();
    });

    // Auto-hide title bar when dragging
    mainWindow.webContents.on('did-finish-load', () => {
      if (mainWindow) {
        const setThumbState = () => {
          if (!mainWindow.isFocused()) {
            mainWindow.setOverlayIcon(new Image(), 'GameSpace is not active');
          } else {
            // Set a custom icon here
          }
        };

        try {
          mainWindow.setThumbnailScaleFactor(150);
        } catch (e) {
          console.warn('Cannot set thumbnail: OS compatibility issue', e.message);
        }

        if (window.getDisplayMedia && window.getDisplayMedia.idleStateSupported) {
          new IdleObserver(setThumbState).observe();
        } else {
          console.log('idlestate API is not available');
        }

        mainWindow.on('blur', setThumbState);
      }
    });

  } catch (error) {
    console.error('❌ Failed to create window:', error);
    app.quit();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('second-instance', () => {
  mainWindow.show();
});

// Handle app events gracefully
app.on('will-quit', () => {
  IPCWrapper.getInstance().destroy();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    process.exit(0);
  }
});

// IPC Handler Registry
const IPCHandlers = new Map();

IPCWrapper = {
  getInstance: () => {
    return this;
  },
  
  add: (channel, handler, shouldCatch) => {
    if (!['object', 'function'].includes(typeof handler)) {
      throw new Error('Handler must be a function!');
    }
    
    if (!shouldCatch && typeof handler !== 'function' || !handler) {
      console.warn(`Warning: Channel ["${channel}"] handler is invalid. Skipping...`);
    } else {
      IPCHandlers.set(channel, { handler, shouldCatch });
    }
  },

  setGlobal: (key, handler) => {
    if (!['object', 'function'].includes(typeof handler)) {
      throw new Error('Handler must be a function!');
    }
    ipcMain.handle(key, handler);
  },

  destroy: () => {
    IPCHandlers.clear();
  }
};

// Register global handlers first
app.name = 'GameSpace';
IPCWrapper.add('gameWindowManager', () => null, true);
IPCWrapper.add('getPlatformInfo', () => null, true);

if (process.platform === 'linux') {
  IPCWrapper.add('setSystemTheme', (event, data) => null, true);
}

// Expose React Renderer to Node for communication
ipcMain.handle('renderer-to-node', async () => {
  console.log('Renderer process communicating with Node.js');
  return { success: true };
});

app.on('before-quit', (event) => {
  // Gracefully handle cleanup before exit
  window.close();
});
