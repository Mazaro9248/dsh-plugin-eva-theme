# 令牌对照表

> 本文件由 `node tools/build-docs.mjs` 从 [`lib/client.js`](../lib/client.js) 的 `PALETTE` 表生成，请勿手工编辑。

插件共覆盖 **107** 个 `--dsw-alias-*` 令牌（DSH 客户端主题层共暴露 107 个别名令牌）。
未被覆盖的令牌保持 DSH 原值——原值通常已经足够中性，皮肤只在「语义需要换色」的地方下手。

## 为什么是别名层

`ctx.theme` 组合出的主题快照由 ui-layout 以 **inline style** 写到 `<body>` 上：

```js
body.style.setProperty(name, value)   // name = --dsw-alias-*，value = 当前色板解析值
```

inline style 的优先级高于任何样式表规则，所以第三方皮肤**不能**靠 CSS 覆盖 `--dsw-alias-*`，
必须走 `ctx.theme.overrideTokens(source, tokens)` 让覆盖进入快照本身。本插件即按此实现。

相应的，不在快照里的令牌（例如 `--dsw-radius-*`、`--dsw-focus-ring-width`）可以用普通 CSS 覆盖，
它们由 `lib/client.js` 的 `SKIN_CSS` 处理。

## 底色 / 表面层

| 令牌 | 亮色 · 绫波丽 | 暗色 · 明日香 |
| --- | --- | --- |
| `--dsw-alias-bg-base` | `#eff6fa` | `#0d0f13` |
| `--dsw-alias-bg-layer-1` | `#f7fbfd` | `#14171c` |
| `--dsw-alias-bg-layer-2` | `#ffffff` | `#1c2028` |
| `--dsw-alias-bg-layer-3` | `#e4eef5` | `#272c35` |
| `--dsw-alias-bg-overlay` | `#ffffff` | `#20252d` |
| `--dsw-alias-bg-module-platform` | `#eaf2f7` | `#181c23` |
| `--dsw-alias-bg-multi-select` | `#23799d1f` | `#ff354d1a` |
| `--dsw-alias-bg-skeleton` | `#0000000a` | `#ffffff0f` |
| `--dsw-alias-bg-document-preview` | `#f7fbfd` | `#14171c` |
| `--dsw-alias-bg-document-selection` | `#23799d52` | `#ff354d59` |
| `--dsw-alias-bg-mask-1` | `#0000003d` | `#0000005c` |
| `--dsw-alias-bg-mask-2` | `#0000001f` | `#00000033` |
| `--dsw-alias-bg-mask-3` | `#0000007a` | `#0000008a` |
| `--dsw-alias-bg-mask-drop` | `#ffffffb3` | `#181c23cc` |
| `--dsw-alias-bg-mask-photo` | `#000000e0` | `#000000e6` |

## 文本层级

| 令牌 | 亮色 · 绫波丽 | 暗色 · 明日香 |
| --- | --- | --- |
| `--dsw-alias-label-document-preview` | `#476173` | `#dacbc0` |
| `--dsw-alias-label-primary` | `#203849` | `#fff1e7` |
| `--dsw-alias-label-secondary` | `#476173` | `#c6b7ac` |
| `--dsw-alias-label-tertiary` | `#526c7c` | `#b3a294` |
| `--dsw-alias-label-caption` | `#718998` | `#8e8178` |
| `--dsw-alias-label-primary-dimmed` | `#314d60` | `#dacbc0` |
| `--dsw-alias-label-primary-bluish` | `#263f52` | `#fff5ef` |
| `--dsw-alias-label-dimmed` | `#b6cad7` | `#63646a` |
| `--dsw-alias-label-primary-inverted` | `#ffffff` | `#101116` |
| `--dsw-alias-label-primary-foreground` | `#ffffff` | `#101116` |
| `--dsw-alias-label-shimmer` | `#2f7190` | `#ff9ca8` |
| `--dsw-alias-label-deep-diving` | `#176b91` | `#ff354d` |
| `--dsw-alias-label-deep-diving-shimmer` | `#2f7190` | `#ff9ca8` |

## 边框（角色主色发丝线）

| 令牌 | 亮色 · 绫波丽 | 暗色 · 明日香 |
| --- | --- | --- |
| `--dsw-alias-border-l1` | `#28698a17` | `#f33a5124` |
| `--dsw-alias-border-l2` | `#28698a29` | `#f33a513d` |
| `--dsw-alias-border-l3` | `#28698a40` | `#f33a5157` |
| `--dsw-alias-border-l4` | `#28698a59` | `#f33a517a` |
| `--dsw-alias-border-l2-darkmode-thin` | `#28698a29` | `#f33a511f` |
| `--dsw-alias-border-inverted` | `#0000` | `#0000` |
| `--dsw-alias-border-inverted2` | `#0000` | `#0000` |

## 品牌色 = 主色

| 令牌 | 亮色 · 绫波丽 | 暗色 · 明日香 |
| --- | --- | --- |
| `--dsw-alias-brand-primary` | `#176b91` | `#ff354d` |
| `--dsw-alias-brand-primary-invert` | `#1a0c10` | `#fff1e7` |
| `--dsw-alias-brand-primary-new-colorprimary-new-color` | `#176b91` | `#ff354d` |
| `--dsw-alias-brand-text` | `#28698a` | `#ff5967` |

## 按钮

| 令牌 | 亮色 · 绫波丽 | 暗色 · 明日香 |
| --- | --- | --- |
| `--dsw-alias-button-primary-fill` | `#176b91` | `#ff354d` |
| `--dsw-alias-button-primary-hover` | `#115777` | `#ff5967` |
| `--dsw-alias-button-primary-dimmed` | `#176b9133` | `#ff354d47` |
| `--dsw-alias-button-contrast-fill` | `#314d60` | `#fff1e7` |
| `--dsw-alias-button-elevated-fill` | `#ffffff` | `#30363f` |
| `--dsw-alias-button-floating-fill` | `#ffffff` | `#1b2027` |
| `--dsw-alias-button-floating-hover` | `#eaf2f7` | `#30363f` |
| `--dsw-alias-button-ghost-active-fill` | `#23799d1f` | `#ff354d1f` |
| `--dsw-alias-button-ghost-active-border` | `#23799d59` | `#ff354d59` |
| `--dsw-alias-button-ghost-active-hover` | `#23799d2e` | `#ff354d2e` |
| `--dsw-alias-button-info-fill` | `#2672631f` | `#8dc3581f` |
| `--dsw-alias-button-info-hover` | `#26726333` | `#8dc35833` |
| `--dsw-alias-button-tool-bar-fill` | `#f7fbfd` | `#1b2027` |
| `--dsw-alias-button-tool-bar-fill-invisible` | `#0000` | `#0000` |
| `--dsw-alias-button-tool-bar-hover` | `#23799d1f` | `#ff354d1f` |

## 交互反馈

| 令牌 | 亮色 · 绫波丽 | 暗色 · 明日香 |
| --- | --- | --- |
| `--dsw-alias-interactive-bg-hover` | `#23799d14` | `#ff354d14` |
| `--dsw-alias-interactive-bg-hover-accent` | `#23799d24` | `#ff354d24` |
| `--dsw-alias-interactive-bg-hover-danger` | `#ad3d571f` | `#ff849424` |
| `--dsw-alias-interactive-bg-hover-solid` | `#00000014` | `#ffffff1a` |
| `--dsw-alias-interactive-bg-active` | `#23799d24` | `#ff354d24` |

## 状态语义

| 令牌 | 亮色 · 绫波丽 | 暗色 · 明日香 |
| --- | --- | --- |
| `--dsw-alias-state-business-primary` | `#176b91` | `#ff354d` |
| `--dsw-alias-state-business-tertiary` | `#176b9159` | `#ff354d66` |
| `--dsw-alias-state-success-primary` | `#267263` | `#8dc358` |
| `--dsw-alias-state-success-secondary` | `#267263cc` | `#8dc358cc` |
| `--dsw-alias-state-success-tertiary` | `#26726359` | `#8dc35866` |
| `--dsw-alias-state-warn-primary` | `#926008` | `#e5a24f` |
| `--dsw-alias-state-warn-secondary` | `#926008cc` | `#e5a24fcc` |
| `--dsw-alias-state-warn-tertiary` | `#92600859` | `#e5a24f66` |
| `--dsw-alias-state-warn-label` | `#805408` | `#e5a24f` |
| `--dsw-alias-state-error-primary` | `#ad3d57` | `#ff8494` |
| `--dsw-alias-state-error-secondary` | `#ad3d57cc` | `#ff8494cc` |
| `--dsw-alias-state-idle-primary` | `#9eb6c5` | `#686b73` |

## 链接

| 令牌 | 亮色 · 绫波丽 | 暗色 · 明日香 |
| --- | --- | --- |
| `--dsw-alias-link` | `#28698a` | `#ff8290` |

## 滚动条

| 令牌 | 亮色 · 绫波丽 | 暗色 · 明日香 |
| --- | --- | --- |
| `--dsw-alias-scrollbar-bg-l1` | `#28698a2e` | `#f33a512e` |
| `--dsw-alias-scrollbar-bg-l2` | `#28698a24` | `#f33a5124` |
| `--dsw-alias-scrollbar-hover-l1` | `#28698a59` | `#f33a515c` |
| `--dsw-alias-scrollbar-hover-l2` | `#28698a47` | `#f33a5147` |

## 菜单

| 令牌 | 亮色 · 绫波丽 | 暗色 · 明日香 |
| --- | --- | --- |
| `--dsw-alias-menu-icon` | `#314d60` | `#dacbc0` |
| `--dsw-alias-menu-group-header-fill` | `#f7fbfdf0` | `#14171cf0` |

## 气泡提示

| 令牌 | 亮色 · 绫波丽 | 暗色 · 明日香 |
| --- | --- | --- |
| `--dsw-alias-tooltip-bg` | `#203b4cf2` | `#272c35f2` |
| `--dsw-alias-tooltip-key-bg` | `#3d596a` | `#37404b` |

## 系统提示

| 令牌 | 亮色 · 绫波丽 | 暗色 · 明日香 |
| --- | --- | --- |
| `--dsw-alias-toast-bg` | `#203b4cf7` | `#272c35f7` |
| `--dsw-alias-toast-label` | `#eff6fa` | `#fff1e7` |

## 开关

| 令牌 | 亮色 · 绫波丽 | 暗色 · 明日香 |
| --- | --- | --- |
| `--dsw-alias-switch-thumb` | `#ffffff` | `#ffe1bb` |

## 设置卡片

| 令牌 | 亮色 · 绫波丽 | 暗色 · 明日香 |
| --- | --- | --- |
| `--dsw-alias-settings-card-fill` | `#f7fbfd` | `#14171c` |
| `--dsw-alias-settings-card-stroke` | `#28698a29` | `#f33a5133` |

## Markdown / 代码

| 令牌 | 亮色 · 绫波丽 | 暗色 · 明日香 |
| --- | --- | --- |
| `--dsw-alias-markdown-code-block` | `#eaf2f7` | `#10141a` |
| `--dsw-alias-markdown-code-block-banner` | `#e4eef5` | `#1c2028` |
| `--dsw-alias-markdown-inline-code` | `#23799d1a` | `#ff354d1f` |
| `--dsw-alias-markdown-citation` | `#23799d24` | `#ff354d24` |
| `--dsw-alias-markdown-tag` | `#2672631f` | `#8dc3581f` |
| `--dsw-alias-markdown-placeholder` | `#839aa9` | `#8e8178` |
| `--dsw-alias-markdown-code-segment-selected` | `#23799d33` | `#ff354d33` |
| `--dsw-alias-markdown-code-segment-unselected` | `#0000000f` | `#ffffff14` |

## 代码差异

| 令牌 | 亮色 · 绫波丽 | 暗色 · 明日香 |
| --- | --- | --- |
| `--dsw-alias-code-diff-added` | `#2672631f` | `#8dc3581f` |
| `--dsw-alias-code-diff-deleted` | `#ad3d571f` | `#ff84941f` |

## 文件差异

| 令牌 | 亮色 · 绫波丽 | 暗色 · 明日香 |
| --- | --- | --- |
| `--dsw-alias-file-diff-added-bg` | `#26726314` | `#8dc35814` |
| `--dsw-alias-file-diff-added-gutter` | `#26726324` | `#8dc35824` |
| `--dsw-alias-file-diff-added-marker` | `#267263` | `#8dc358` |
| `--dsw-alias-file-diff-deleted-bg` | `#ad3d5714` | `#ff849414` |
| `--dsw-alias-file-diff-deleted-gutter` | `#ad3d5724` | `#ff849424` |
| `--dsw-alias-file-diff-deleted-marker` | `#ad3d57` | `#ff8494` |

## 引导页

| 令牌 | 亮色 · 绫波丽 | 暗色 · 明日香 |
| --- | --- | --- |
| `--dsw-alias-onboarding-accent` | `#176b91` | `#ff354d` |
| `--dsw-alias-onboarding-card-fill` | `#f7fbfd` | `#14171c` |
| `--dsw-alias-onboarding-checkbox-border` | `#28698a59` | `#f33a5159` |
| `--dsw-alias-onboarding-secondary-fill` | `#eaf2f7` | `#272c35` |

## 回合触发器

| 令牌 | 亮色 · 绫波丽 | 暗色 · 明日香 |
| --- | --- | --- |
| `--dsw-alias-turn-trigger-bg` | `#23799d12` | `#ff354d12` |
| `--dsw-alias-turn-trigger-bg-hover` | `#23799d1f` | `#ff354d1f` |
