const express = require('express');
const path = require('path');
const port = process.env.ELECTRON_PORT || 3001;

const app = express();

// Serve static files from www build directory
app.use(express.static(path.join(__dirname, 'www')));

// API endpoint for Electron IPC
app.get('/api/electron', (req, res) => {
  res.json({ isElectron: true, storePath: '/app/electron-store.json' });
});

const server = app.listen(port, () => {
  console.log(`Serving React build at http://localhost:${port}`);
});

module.exports = { app, server };
