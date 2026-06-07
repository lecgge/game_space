import { BrowserWindow, screen, nativeImage } from 'electron';

const WindowManager = {
  _windows: new Map(),

  /**
   * Create main window with Electron-specific configurations
   */
  createMain({ url }) {
    const mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 700,
      frame: false,
      backgroundColor: '#030518',
      transparent: true,
      hasShadow: false,
      titleBarStyle: 'hidden',
      webPreferences: {
        devTools: process.env.NODE_ENV === 'development' || process.argv.join(' ').includes('--dev'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
    });

    mainWindow.loadURL(url);

    // Add frame component to renderer
    this.injectFrame(mainWindow);

    // Menu builder configuration
    const menuBuilder = new MenuBuilder();
    const platformMenus = {
      win32: {
        label: 'Game Space',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { type: 'separator' },
          { role: 'selectAll' },
        ],
      },
      linux: menuBuilder.buildWindowsMenu(),
    };

    if (platformMenus[platform]) {
      const menu = platformMenus[platform];
      // Apply custom labels to Windows menu items
      this.applyCustomLabels(window, platformMenus.win32);
    }

    // Add IPC listeners after window creation
    this.addIPCListeners(mainWindow);

    // Window event handlers
    mainWindow.on('maximize', () => {
      this._windows.forEach((win) => win.minimize());
    });

    return mainWindow;
  },

  /**
   * Inject custom frame wrapper around iframe content
   */
  injectFrame(window) {
    const template = `
    <div class="frame-wrapper">
      <div class="window-frame" id="game-space-frame">
        <iframe 
          src="${window.location.href}" 
          id="renderer-iframe"
          class="frame-inner rounded-[2.5rem] border border-white/10 backdrop-blur-xl shadow-[0_8px_32px_-8px_rgba(1,electron.ipcRenderer,shadow)"
        ></iframe>
      </div>
    </div>
    
    <style>
      #game-space-frame {
        position: fixed;
        top: 50%;
        left: 50%;
        transform-origin: center center;
        z-index: 1000;
        transition: all 300ms ease;
      }
      
      #renderer-iframe {
        border-radius: 2.5rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.05);
      }
    </style>`;

    window.electron.ipcRenderer.send('add-frame', template);
  },

  /**
   * Apply custom labels to standard menu roles
   */
  applyCustomLabels(window, items) {
    items.forEach(item => {
      const menuItem = item;
      
      if (item.label === 'Game Space') {
        const aboutItem = menuItem.submenu.find(i => i.role === 'about');
        this.updateMenuItem(aboutItem, 'About Game', true);
        
        const quitItem = menuItem.submenu.find(i => i.role === 'quit');
        this.updateMenuItem(quitItem, 'Exit Game Space', true);
      } else if (item.label === 'File') {
        this.updateMenuItem(menuItem.submenu[1], 'Open Project');
      } else if (item.label === 'Edit') {
        const undoItem = menuItem.submenu.find(i => i.role === 'undo');
        this.updateMenuItem(undoItem);
        
        const redoItem = menuItem.submenu.find(i => i.role === 'redo');
        this.updateMenuItem(redoItem);
      }
    });
  },

  /**
   * Helper to update menu item properties
   */
  updateMenuItem(menuItem, text, isHeader = false) {
    if (!menuItem) return;
    
    this._updateMenuItemLabel(menuItem, text);
  },

  /**
   * Core function to modify label and accelerator
   */
  _updateMenuItemLabel(menuItem, text) {
    if (typeof menuItem.label === 'string') {
      const separatorIndex = Math.max(0, menuItem.label.lastIndexOf('-'));
      let newLabel = menuItem.label.substring(0, separatorIndex);

      const accel = menuItem.accelerator;
      if (accel && !text.includes(' ')) {
        newLabel += ` (\`${accel}\`)`;
      }

      menuItem.label = text || `${newLabel}`.trim();
    }
  },

  /**
   * Add IPC handlers for window control
   */
  addIPCListeners(window) {
    // Minimize window handler
    const handleMinimize = () => {
      window.minimize();
    };

    // Maximize handler with animation
    const handleMaximize = () => {
      if (window.isMaximized()) {
        window.unmaximize();
        this.animateResize(window, 'normal');
      } else {
        window.maximize();
        this.animateResize(window, 'fullscreen');
      }
    };

    // Add custom IPC events
    window.webContents.on('new-window', () => {
      const newWindow = BrowserWindow.getAllWindows().find(w => w.id !== window.id);
      if (newWindow) {
        newWindow.show();
      }
    });

    return {
      minimize: handleMinimize,
      maximize: handleMaximize,
    };
  },

  /**
   * Add IPC handlers for document actions
   */
  addIPCEvents(window) {
    // Minimize window when clicked
    window.webContents.on('before-input-event', (event, input) => {
      if (input.type === 'keyDown' && input.code === 'KeyM') {
        event.preventDefault();
        this.minimizeWindow(window);
      }
    });

    // Handle keyboard shortcuts for maximize/minimize
    window.on('minimize-window', () => {
      window.minimize();
    });

    window.on('maximize-window', () => {
      if (!window.isMaximized()) {
        window.maximize();
      }
    });

    window.on('un-maximize', () => {
      if (window.isMaximized()) {
        window.unmaximize();
      }
    });
  },

  /**
   * Animate window resize with smooth transition
   */
  animateResize(window, target) {},

  // Getter for all windows instance
  _getInstance() {},
};

export default WindowManager;
