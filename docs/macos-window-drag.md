# macOS 窗口拖动兼容性

0.51.1 修复了 0.51.0 在使用 macOS 页面拖动区域的 DSH 桌面宿主中，启用主题后窗口无法拖动的问题。升级后按宿主提示重载插件或应用，已有显示与语言设置保留。

## 原因

部分 DSH 前端包含以下保护规则：

```css
html[data-platform=darwin] [data-window-drag]{-webkit-app-region:drag}
html[data-platform=darwin] body>:not(#root){-webkit-app-region:no-drag}
```

旧版的全屏装饰层与启动层直接挂到 body，被第二条规则计算成全屏 no-drag。即使装饰层使用 pointer-events:none，原生窗口拖动区域仍可能被整个减去。Electron 将拖动与非拖动区域作为矩形处理，drag 区域也会忽略普通指针事件，见 [官方说明](https://www.electronjs.org/docs/latest/tutorial/custom-window-interactions)。

## 修复

- 两个全屏层统一优先挂在 #root 内，独立预览等无 root 页面仍可回退 body；不改动宿主 html／body 的拖动属性。
- 启动阶段沿自身祖先链隔离兄弟节点，避免把包含启动层的 root 设为 inert；退出恢复隔离前的值。
- 仅在 macOS 平台为启动背景声明 drag。头像、插入栓、二者之间的整个网格和所有交互控件声明 no-drag，保证拖放移动、放手、按钮与键盘操作不被窗口拖动截获。Windows／Linux 不强制应用这组区域样式。
- 提示音观察器监听 body 和当前 root 的直接子节点，root 替换时重新绑定。重播暂停正在播放的提醒，退出或欢迎音结束后恢复仍有效的队列，卸载回收监听。不监听整棵 DOM 的文字、进度和动画变化。

可在启动背景空白处拖动窗口；头像与装载网格保留给驾驶员拖放。原生拖动区域内的普通点击可能不会触发浏览器的自动播放重试，可使用音乐按钮或驾驶员卡开始播放。

## 验证

```sh
npm run test:window-drag
npm run test:attention
npm run test:boot
npm run release
```

窗口拖动测试使用 DSH 前端的 macOS 规则，覆盖真实 root、嵌套宿主内容、无 root 回退、模态弹窗和退出恢复。启动回归在同样的平台规则与 root 挂载下执行实际浏览器拖放和完整 MP3 播放；提示音回归覆盖 root 替换、body 欢迎音以及暂停／恢复。

这些检查验证 CSS 和 Web 行为。发布或适配新宿主版本时，还需在目标 macOS Electron 窗口核对：主界面标题栏可拖动；GIF／警报／选择页空白可拖动；头像可跨网格拖入；音乐、语言、跳过及远程控制弹窗可操作；重播和进入聊天无重叠提醒。独立原生标题栏或普通浏览器的行为可能不同。
