# 惊喜内容 · 源代码

手机版「惊喜内容」APK 与电脑版「惊喜内容管理后台」的完整源代码。

## 目录
- `source/phone/` 手机端（Capacitor www 资源）：`index.html`（含静默更新 / 卡片滑动 / 视频 / 动画）、`content.json`（内置默认内容）
- `source/admin/` 电脑版管理后台（Electron）：`index.html`（界面+全部逻辑）、`main.js`（主进程：APK打包 / 发布到GitHub）、`preload.js`
- `source/build_apk.bat` APK 打包脚本（xcopy 同步 + Gradle assembleDebug）

## 手机端更新机制
启动时从本仓库 `content.json` 拉取内容，与本地版本号对比，有新版即静默替换（免重装）。更新源：raw.githubusercontent.com 与 jsDelivr CDN 双兜底。

## 卡片功能
- 每张卡片可选类型：文字 / 一封信 / 图片 / 视频 / 网站链接
- 每张卡片可选动画：淡入 / 上浮 / 放大 / 浮动 / 微光
- 0912 生日专页拆为可左右滑动卡片（认识天数 / 生日信 / 照片墙）
