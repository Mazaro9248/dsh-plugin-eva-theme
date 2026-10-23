# 资源规范与来源

运行时媒体集中于 `assets/`，统一使用小写英文短横线命名。角色资源以 `asuka-`／`rei-` 开头，语音使用 `角色-voice-用途.mp3`。每个资源的路径、类型、字节数与 SHA-256 由 [资源清单](../assets/manifest.json) 记录。

PNG、MP3 和原始 NERV SVG 均保留提供时的原始字节，仅调整位置与名称。运行时不读取维护者的桌面、下载目录或临时目录。

## 图像与矢量

| 位置（相对 assets/） | 来源与用途 |
| --- | --- |
| `source/nerv-boot-original.gif` | 用户提供的「开机动画.gif」，256×256、48 帧、80ms／帧、一轮 3840ms；原始字节保留，仅开发仓库包含 |
| `animations/nerv-boot.gif` | 从原始 GIF 生成，只将控制块延迟改为 40ms 并循环；两轮仍为 3840ms，调色板与压缩帧无损保留，界面按 512×512 显示 |
| `svg/nerv-logo.svg` | 用户提供的 `nerv-1.svg`；原始字节保留，CSS mask 按角色着色 |
| `svg/nerv-emergency.svg` | 按用户参考图以代码重绘的六边形 EMERGENCY／NERV 警报 |
| `svg/eva-entry-plug.svg` | 根据两张概念图以代码重绘，400×800，白色长筒、橙金端盖、角色色环；装配容器倾斜 14° |
| `images/asuka-portrait-lineart.png` | 明日香侧身回望半身、长双马尾，1024×1536 透明 PNG |
| `images/rei-portrait-lineart.png` | 绫波丽侧身回望半身、短发，1024×1536 透明 PNG |
| `images/asuka-avatar-closed-eyes.png` | 明日香闭眼头像线稿，1254×1254 透明 PNG |
| `images/rei-avatar-closed-eyes.png` | 绫波丽闭眼头像线稿，1254×1254 透明 PNG |

角色线稿由内置图像生成工具根据维护者参考制作，使用 alpha 蒙版按主题着色。完整提示词见 [半身线稿](prompts/character-portraits.md) 与 [驾驶员头像](prompts/pilot-avatars.md)。参考构图与早期原型放在 `docs/reference/`，不打入运行时包。

## 角色语音

全部由用户提供，原字节随包保留；下表时长仅用于记录，启动进度按浏览器实际音频时钟驱动。路径均相对 `assets/audio/`。

| 文件 | 原文件／台词 | 字节 | 时长（约） |
| --- | --- | ---: | ---: |
| `asuka-voice-boot.mp3` | 明日香-2026-10-23-23-46-接続開始。シンクロ率、上昇中。同期完了。指示を待機。.mp3 | 107483 | 6.71s |
| `rei-voice-boot.mp3` | Ayanami-Rei-2026-10-24-01-25-システム起動。接続、確認。……準備、できた。.mp3 | 104975 | 6.56s |
| `asuka-voice-select.mp3` | 明日香-2026-10-24-04-09-私に任せなさい！.mp3 | 28489 | 1.78s |
| `rei-voice-select.mp3` | Ayanami-Rei-2026-10-24-04-07-……指示をください。.mp3 | 20548 | 1.28s |
| `asuka-voice-approval.mp3` | 明日香-2026-10-24-04-38-準備できたわ。確認してくれる？.mp3 | 43535 | 2.72s |
| `rei-voice-approval.mp3` | Ayanami-Rei-2026-10-24-04-39-待機中。……指示をください。.mp3 | 51477 | 3.21s |
| `asuka-voice-complete.mp3` | 明日香-2026-10-24-04-45-任務完了！これくらい、楽勝よ！.mp3 | 55238 | 3.45s |
| `rei-voice-complete.mp3` | Ayanami-Rei-2026-10-24-04-44-任務、完了。……確認してください。.mp3 | 57746 | 3.60s |

选择应答在按住头像时触发一次，快速装载等待应答完整结束再播放长启动语音。审核提醒读取人工待审核状态，完成提醒只读取已载入主会话的新正常完成事件；声音不操作审核、不推进任务。显示设定提供开关与试听。

背景音乐为 `audio/nerv-boot-music.mp3`，原文件与再分发说明见 [启动音乐记录](boot-music.md)。

## 构建与服务

`npm run build` 从清单生成小型资源索引、加速 GIF 和 `workers/boot-contours.js`；`npm run check` 检查生成文件一致性。新增资源必须加入清单并记录来源。`npm run test:assets` 校验原文件摘要、遗漏与未引用文件，以及静态服务缓存、Range 和访问路径。

大媒体通过同源 `/dsh-eva-magi/assets/` 路由提供，版本查询参数由内容摘要生成，支持长期缓存与音频分段读取。仅两个需要动态改色和填充的紧凑 SVG 内联到客户端。等高线工作线程与主线程回退由同一几何函数生成，四个时间点的路径摘要保证形状一致。
