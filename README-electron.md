# GameSpace - Premium Gaming Platform (Electron)

## Architecture Overview

```
game_space/
├── src/
│   ├── main.js              # Electron Main Process Entry Point
│   ├── preload.js           # IPC Bridge for secure renderer-node communication
│   ├── App.jsx              # Root React Component with routing
│   ├── main.jsx             # React DOM entry point (browser)
│   ├── index.css            # Global CSS styles
│   └── pages/               # Page components
│       ├── HomePage        # Landing/home page
│       ├── DashboardPage   # User dashboard
│       ├── SocialsPage     # Activity feed
│       ├── FriendsPage     # Friend management
│       ├── ProfilePage     # User profile (NEW)
│       └── SettingsPage    # Application settings
├── public/                  # Static assets
├── package.json             # Dependencies & scripts
└── vite.config.js           # Vite + Electron configuration
```

## Installation

```powershell
# Install dependencies
npm install

# Start in dev mode (no browser, just window)
npm run electron

# OR start with dev server + renderer
npm run dev
```

## File Structure

### Main Process (`src/main.js`)
- Creates the main BrowserWindow
- Handles app lifecycle events (ready, activate, quit)
- Manages IPC channels for Node.js ↔ React communication
- Secure sandbox (contextIsolation: true, nodeIntegration: false)

### Preload Script (`src/preload.js`)
- Exposes safe IPC methods to `window.electronAPI`
- Enables renderer process to communicate with main process
- Bridge pattern for secure inter-process communication

### App.jsx
- Central routing component
- Manages active page state
- Renders different page components based on navigation context

## Electron Integration

### Window Properties
```javascript
{
  width: 1440,
  height: 980,
  backgroundColor: '#0a0c15',
  titleBarStyle: 'hidden',
  icon: path.resolve(__dirname, '../resources/icon.png')
}
```

### IPC Communication Patterns

**Main → Renderer**: Send messages via IPC channels

```javascript
// In renderer (React)
window.electronAPI.sendMessageToNode('app-version', {})
  .then(data => console.log(data))
```

**Renderer → Main**: Request data from Node APIs

```javascript
// main.js handlers
ipcMain.handle('get-games', async () => {
  const DB = require('./db'); // Your database module
  return await DB.getGames();
});
```

## Development Workflow

### Hot Reload Setup
1. **Vite Dev Server** runs on `http://localhost:3000`
2. **Main Process** loads dev server via protocol in development
3. **Electron Window** shows UI when ready
4. Changes auto-reload without code restarts

### Production Build
```bash
npm run build        # Vite bundles React + main process
npm run electron:build # Builds executable (.exe, .dmg, .app)
```

## Security Best Practices

✅ **Context Isolation**: Renderer cannot access Node.js directly  
✅ **Node Integration Disabled**: Only allowed via IPC bridge  
✅ **Preload Script**: Defines safe API surface area  
✅ **No eval() or dynamic imports in preload**  

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run electron` | Run Electron app (no browser dev tools) |
| `npm run dev` | Vite dev server only |
| `npm run build` | Production build for dist folder |
| `npm run electron:build` | Create distributable executables |
| `npm run electron:pack` | Pack unpacked app to directory |

## Adding New Pages

1. Create component: `src/pages/NewPage.jsx`
2. Export from `App.jsx`: `{ activePage === 'new' && <NewPage /> }`
3. Add navigation link in Layout sidebar
4. (Optional) Add IPC handlers for backend communication

## Notes

- All React components must be standard JSX with proper state management
- Electron preload is a security layer, NOT for heavy logic
- Main process can access file system without Node.js restrictions
