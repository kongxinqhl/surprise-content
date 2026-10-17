const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

function createWindow(){
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 640,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    backgroundColor: '#0e0e16',
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, preload: path.join(__dirname, 'preload.js') }
  });
  win.loadFile('index.html');
  win.setMenuBarVisibility(false);
  return win;
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  const win = createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

  ipcMain.handle('publish-mobile', (_e, contentJson) => {
    return new Promise((resolve) => {
      const desktopDir = 'C:\\Users\\16608\\Doubao\\chats\\2026-10-17\\new-chat\\desktop';
      const apkBuildDir = path.join(desktopDir, 'apk-build');
      const wwwDir = path.join(apkBuildDir, 'www');
      // 1. 写入内容文件
      try {
        fs.mkdirSync(wwwDir, { recursive: true });
        fs.writeFileSync(path.join(wwwDir, 'content.json'), JSON.stringify(contentJson, null, 2), 'utf-8');
      } catch (err) {
        win.webContents.send('build-output', '[错误] 写入内容失败: ' + err.message);
        resolve('write-failed');
        return;
      }
      win.webContents.send('build-output', '[已写入] 内容已保存到手机版应用的 content.json');
      // 2. 运行打包脚本
      const script = 'C:\\Users\\16608\\Doubao\\chats\\2026-10-17\\new-chat\\desktop\\build_apk.bat';
      if (!fs.existsSync(script)) {
        win.webContents.send('build-output', '[错误] 找不到打包脚本 build_apk.bat');
        resolve('script-missing');
        return;
      }
      const child = spawn('cmd', ['/c', script], { cwd: desktopDir });
      child.stdout.on('data', d => win.webContents.send('build-output', d.toString()));
      child.stderr.on('data', d => win.webContents.send('build-output', d.toString()));
      child.on('close', (code) => {
        if (code === 0) {
          try {
            const outDir = path.join(apkBuildDir, '发布');
            fs.mkdirSync(outDir, { recursive: true });
            const srcApk = path.join(apkBuildDir, 'release', 'surprise.apk');
            const dstApk = path.join(outDir, '惊喜内容.apk');
            fs.renameSync(srcApk, dstApk);
            win.webContents.send('build-output', '\n[完成] 打包成功！新APK：' + dstApk);
            resolve('done');
          } catch (err) {
            win.webContents.send('build-output', '\n[完成] APK 已生成，但重命名失败: ' + err.message);
            resolve('done');
          }
        } else {
          win.webContents.send('build-output', '\n[完成] 打包失败，请查看上方输出。');
          resolve('build-failed');
        }
      });
    });
  });

  ipcMain.handle('publish-github', async (_e, contentJson, settings) => {
    const send = (line) => win.webContents.send('build-output', line);
    try {
      const { owner, repo, branch, token } = settings;
      if (!owner || !repo || !token) { send('[错误] 缺少 GitHub 所有者/仓库/令牌'); return 'no-settings'; }
      const api = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
      const headers = {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'surprise-admin'
      };
      const branchRef = branch || 'main';
      let sha = null;
      const getRes = await fetch(`${api}/contents/content.json?ref=${encodeURIComponent(branchRef)}`, { headers });
      if (getRes.ok) {
        const j = await getRes.json();
        sha = j.sha;
        send('[信息] 已在仓库找到旧内容，将覆盖更新');
      } else if (getRes.status === 404) {
        send('[信息] 仓库还没有 content.json，将新建');
      } else {
        send('[错误] 无法读取仓库文件（HTTP ' + getRes.status + '），请检查令牌是否有读写权限');
        return 'get-failed';
      }
      const body = {
        message: '惊喜内容发布：内容更新 ' + new Date().toLocaleString('zh-CN'),
        content: Buffer.from(contentJson, 'utf-8').toString('base64'),
        branch: branchRef
      };
      if (sha) body.sha = sha;
      const putRes = await fetch(`${api}/contents/content.json`, { method: 'PUT', headers, body: JSON.stringify(body) });
      if (!putRes.ok) {
        const err = await putRes.json().catch(() => ({}));
        send('[错误] GitHub 上传失败（HTTP ' + putRes.status + '）：' + (err.message || putRes.statusText));
        return 'push-failed';
      }
      send('[完成] 已发布到 GitHub！手机端下次启动会自动更新为最新内容');
      return 'done';
    } catch (err) {
      send('[错误] 发布到 GitHub 异常：' + err.message);
      return 'error';
    }
  });
});
app.on('window-all-closed', () => { app.quit(); });
