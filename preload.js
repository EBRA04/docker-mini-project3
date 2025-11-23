const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sandboxAPI', {
  start: () => ipcRenderer.invoke('sandbox:start'),
  stop: () => ipcRenderer.invoke('sandbox:stop'),
  reset: () => ipcRenderer.invoke('sandbox:reset'),
  logs: () => ipcRenderer.invoke('sandbox:logs')
});
