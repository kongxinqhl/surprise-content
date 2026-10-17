const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('api', {
  publishMobile: (contentJson) => ipcRenderer.invoke('publish-mobile', contentJson),
  onBuildOutput: (cb) => ipcRenderer.on('build-output', (_e, line) => cb(line)),
  publishGithub: (contentJson, settings) => ipcRenderer.invoke('publish-github', contentJson, settings),
  githubGet: () => ipcRenderer.invoke('github-get'),
  githubSave: (settings) => ipcRenderer.invoke('github-save', settings),
  getVideoPath: (file) => webUtils.getPathForFile(file),
  uploadRepoFile: (localPath, remotePath, settings) => ipcRenderer.invoke('upload-repo-file', localPath, remotePath, settings)
});
