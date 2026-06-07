const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => {
    const params = { channel, data };
    ipcRenderer.send('main-to-renderer', params);
  },
  receive: (channel, func) => {
    ipcRenderer.on(channel, (event, args) => func(args));
  }
});
