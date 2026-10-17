const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  publishMobile: (contentJson) => ipcRenderer.invoke('publish-mobile', contentJson),
  onBuildOutput: (cb) => ipcRenderer.on('build-output', (_e, line) => cb(line)),
  publishGithub: (contentJson, settings) => ipcRenderer.invoke('publish-github', contentJson, settings)
});
