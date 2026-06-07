import { Menu as ElectronMenu, MenuItem } from 'electron';
import { app } from 'electron';

/**
 * Main Process Menu Builder
 * Creates native macOS/Windows/Linux menus for Game Space
 */
class MenuBuilder {
  // Default menu configurations
  constructor() {
    this.macOSMenus = ['File', 'Edit', 'View', 'Help'];
    this.windowsMenus = ['File', 'Help'];
  }

  /**
   * Build platform-specific menu and register with Electron
   */
  buildMenu() {
    const platform = process.platform;
    
    // Create menus based on platform
    if (platform === 'darwin') {
      this.buildMacOSMenu();
    } else {
      this.buildWindowsMenu();
    }

    console.log('✓ Main menu built successfully');
  }

  /**
   * Create macOS application menu
   */
  buildMacOSMenu() {
    const appMenu = ElectronMenu.buildMenu({ label: 'Game Space', submenu: [
      { role: 'about' },
      { type: 'separator' },
      { accelerator: 'CmdOrCtrl+N', click: this.newWindow.bind(this) },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' },
    ] });

    const fileMenu = ElectronMenu.buildMenu({ label: 'File', submenu: [
      { role: 'newFile' },
      { role: 'open' },
      { role: 'save' },
      { type: 'separator' },
      { role: 'closeTab' },
      { type: 'separator' },
      { role: 'reload' },
      ...this.getPlatformMenuItems(),
    ] });

    const editMenu = ElectronMenu.buildMenu({ label: 'Edit', submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...this.getEditMenuItems(),
    ] });

    const viewMenu = ElectronMenu.buildMenu({ label: 'View', submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { type: 'separator' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      ...this.getViewMenuItems(),
    ] });

    const helpMenu = ElectronMenu.buildMenu({ label: 'Help', submenu: [
      { 
        label: 'Documentation', 
        click: this.openUrl.bind(this, 'https://docs.gamespace.app')
      }
    ] });

    // Set and display menu bar in main window
    const menu = ElectronMenu.buildMenu([
      appMenu, fileMenu, editMenu, viewMenu, helpMenu,
    ]);
  }

  /**
   * Create Windows/Linux context menu (top bar style)
   */
  buildWindowsMenu() {
    // Windows/Linux uses context menus or top bar
    const contextMenu = ElectronMenu.buildMenu([
      { label: 'File', submenu: [
        { role: 'newFile' },
        { role: 'open' },
        { role: 'save' },
      ]},
      { label: 'View', submenu: [
        { accelerator: 'F12', click: this.toggleDevTools.bind(this) },
        { type: 'separator' },
        { 
          label: 'Toggle DevTools', 
          accelerator: 'Ctrl+Shift+I', 
          click: this.toggleDevTools.bind(this)
        }
      ]},
      { label: 'Help', submenu: [
        { 
          label: 'Documentation', 
          click: this.openUrl.bind(this, 'https://docs.gamespace.app')
        },
      ]}
    ]);
  }

  /**
   * Helper methods for menu item configuration
   */
  newWindow() {} // Placeholder implementation

  getPlatformMenuItems() { [] }
  getEditMenuItems() { [] }
  getViewMenuItems() { [] }

  toggleDevTools() {
    const mainWindow = BrowserWindow.getFocusedWindow();
    if (mainWindow) {
      mainWindow.webContents.toggleDevTools();
    }
  }

  openUrl(url) {
    require('electron').shell.openExternal(url);
  }
}

export default MenuBuilder;
