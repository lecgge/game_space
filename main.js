const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 750,
    backgroundColor: '#181926',
    frame: false,
    titleBarStyle: 'hidden',
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
      worldSafeExecuteJavaScript: false,
    },
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create ambient background animations
  createAmbientAnimations();
}

function createAmbientAnimations() {
  if (!mainWindow || !mainWindow.webContents) return;
  
  // Create two animated blobs using JavaScript canvas on window
  const blob1 = document.createElement('div');
  blob1.className = 'ambient-blob';
  blob1.style.cssText = `
    position: fixed;
    top: 50%;
    left: 25%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(68, 138, 255, 0.08) 0%, transparent 60%);
    border-radius: 50%;
    filter: blur(60px);
    z-index: -1;
    animation: pulse-a 8s ease-in-out infinite;
    pointer-events: none;
  `;

  const blob2 = document.createElement('div');
  blob2.className = 'ambient-blob';
  blob2.style.cssText = `
    position: fixed;
    top: 30%;
    right: 5%;
    width: 350px;
    height: 350px;
    background: radial-gradient(circle, rgba(168, 85, 247, 0.06) 0%, transparent 60%);
    border-radius: 50%;
    filter: blur(60px);
    z-index: -1;
    animation: pulse-b 9s ease-in-out infinite;
    pointer-events: none;
  `;

  document.body.appendChild(blob1);
  document.body.appendChild(blob2);
}

const keyframesString = `
@keyframes pulse-a { 
  0%, 100% { transform: scale(1) translate(-3%, -3%); opacity: 0.6; }
  50% { transform: scale(1.2) translate(-4%, -4%); opacity: 0.75; }
}
@keyframes pulse-b { 
  0%, 100% { transform: scale(1.1) translate(3%, -3%); opacity: 0.5; }
  50% { transform: scale(1.25) translate(4%, -4%); opacity: 0.7; }
}
`;

function injectStyles() {
  const style = document.createElement('style');
  style.textContent = keyframesString;
  if (document.head) document.head.appendChild(style);
}

app.whenReady().then(() => {
  // Inject styles before loading page
  setTimeout(injectStyles, 100);

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
