# 开发与验证

使用 Node.js 22.19+ 或 24+，浏览器验证需要 Chrome／Chromium，可用 `CHROME_PATH` 指定路径。项目零安装依赖，无需运行 `npm install`。

```sh
npm run build        # 生成资源索引、两倍速 GIF、工作线程和令牌文档
npm run check        # 校验生成文件、语法、资源引用与文档链接
npm test             # 宿主接口、资源服务、颜色、音频、启动和布局回归
npm run preview      # 本机 HTTP 测试台；包含模拟会话与真实随包媒体
npm run perf:boot    # 1280×800、1920×1080 各三次真实拖放采样
npm run release      # 完整验证后打包并生成 SHA-256 校验文件
```

只修改源码和原始素材，再执行 `npm run build`。`lib/client.js` 中的生成区、`assets/animations/nerv-boot.gif`、`assets/workers/boot-contours.js`、清单的校验值以及令牌文档由工具维护。运行时不需要构建工具或外部素材目录。

文件使用小写短横线命名；根目录的 README、CHANGELOG、CONTRIBUTING、NOTICE 和 LICENSE 遵循常见项目约定。图片、音频、SVG、动画和工作线程分别放在 `assets/` 的对应目录。新增或替换资源时更新 `assets/manifest.json`，保留来源说明，生成后由检查发现遗漏、重复或未引用的文件。

主题颜色只修改 `PALETTE`。不要把大图片或音频重新写成 data URI；资源通过包内静态路由提供，地址带内容摘要用于缓存更新。等高线主线程回退与 Worker 共用同一几何函数，四个时间点的路径校验用于保持画面一致。

在 DSH Desktop 中使用插件管理器安装本地项目目录。修改后关闭再开启本主题以重新装载模块；宿主接口变动可能需要按应用提示重启。验证两种主题、拖放与点击装载、原始语音完整播放、审核／完成提醒、设置、页面缩放及远程控制关闭。独立测试台不能代替实际 DSH 验收。

提交前执行 `git diff --check` 和 `npm run release`。`dist/`、临时截图、日志与系统缓存不提交；GitHub 发布流程见 [docs/release.md](docs/release.md)。
