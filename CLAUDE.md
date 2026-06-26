# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**DouyinURL提取Pro** — Chrome 扩展，通过 API 拦截 + DOM 降级提取抖音视频数据，支持批量关键词搜索和 CSV/XLSX 导出。

目标用户：需要批量采集抖音视频元数据的运营、研究人员。
核心价值：API 级别的准确性（11 个拦截端点），零依赖 Python/Selenium，浏览器原生运行。

## 开发环境

这是纯 JavaScript Chrome 扩展，**无构建流程**，无 package.json，无 npm。
直接编辑源码后在 Chrome 中重新加载扩展即可测试。

### 加载与调试

1. 修改代码后，访问 `chrome://extensions/`
2. 找到「DouyinURL提取Pro」，点击刷新图标
3. 若修改 manifest.json 或新增文件，需点击「重新加载」
4. 调试 popup：右键扩展图标 → 检查弹出内容
5. 调试 content script：打开抖音页面 → F12 → Console
6. 调试 background：在 `chrome://extensions/` 中点击 Service Worker 链接

### 测试流程

修改后手动验证：
1. 访问 https://www.douyin.com/search/xxx（搜索页）或用户主页
2. 点击扩展图标，检查数据是否正常显示
3. 点击「开始爬取」，观察自动滚动和数据增量
4. 测试 CSV/XLSX 导出，确认文件保存到 `~/Downloads/douyin-url-extractor/` 且格式正确
5. 测试批量关键词搜索（准备测试用 CSV），检查进度面板和合并导出

## 目录结构

```
douyin-url-extractor-pro/
├── manifest.json              # 扩展配置（权限、脚本注入、图标路径）
├── src/                       # 首方源码
│   ├── background/
│   │   └── background.js      # Service Worker：开启侧边栏行为
│   ├── content/
│   │   ├── inject.js          # MAIN world：拦截 fetch/XHR，postMessage 发送数据
│   │   ├── content.js         # ISOLATED world：缓存数据、DOM 降级、响应 popup
│   │   └── content.css        # 页面高亮样式
│   └── popup/
│       ├── popup.html         # 侧边栏 UI 入口
│       ├── popup.css          # 侧边栏样式
│       └── popup.js           # UI 控制器：滚动、批量搜索、导出
├── assets/                    # 静态资源
│   ├── icons/                 # 扩展图标（16/48/128px PNG）
│   └── images/                # 其他图片（如 webrobots_logo.png）
└── lib/                       # 第三方依赖库（CDN 离线版，不修改）
    ├── jquery-3.1.1.min.js
    ├── sha256.min.js
    ├── bootstrap.min.{css,js}
    ├── handsontable.min.{css,js}
    ├── papaparse.min.js
    ├── FileSaver.js
    └── xlsx.full.min.js
```

## 架构核心


### 双通道数据提取

```
用户访问抖音
    ↓
├─ inject.js (MAIN world, 注入到页面)
│   拦截 window.fetch / XMLHttpRequest
│   匹配 11 个 API 端点（/aweme/v1/web/search/item 等）
│   解析 JSON → 提取 aweme 对象 → postMessage 到 content.js
│   
└─ content.js (ISOLATED world, Chrome 环境)
    监听 postMessage，缓存 API 数据到 interceptedAwemes Map
    若 API 未覆盖，降级到 DOM 解析（data-e2e 属性 或 a[href*="/video/"] 链接）
    响应 popup.js 请求，返回去重后的视频列表
```

**为什么两个 world？**
- MAIN world：能访问页面 window 对象，拦截真实 fetch/XHR
- ISOLATED world：能使用 chrome.* API，但无法访问页面 JS 变量

### 关键文件职责

| 文件 | 运行环境 | 职责 |
|------|----------|------|
| `src/background/background.js` | Service Worker | 监听图标点击，打开侧边栏/弹窗 |
| `src/content/inject.js` | MAIN world | API 拦截，解析 JSON，postMessage 发送数据 |
| `src/content/content.js` | ISOLATED world | 数据缓存、DOM 降级、响应 popup 请求 |
| `src/popup/popup.js` | 扩展弹窗 | UI 控制器，滚动逻辑，批量搜索编排，导出 |
| `manifest.json` | — | 扩展配置，权限声明，脚本注入规则 |

### API 拦截端点（11 个）

在 `inject.js` 中硬编码匹配：
- `/aweme/v1/web/search/item` — 搜索结果
- `/aweme/v1/web/aweme/post` — 用户主页
- `/aweme/v1/web/discover/feed` — 发现页
- `/aweme/v1/feed` — 首页信息流
- `/aweme/v1/web/tab/feed` — Tab 推荐
- `/aweme/v1/web/relation/follow/feed` — 关注页
- `/aweme/v1/web/mix/aweme` — 合集
- `/aweme/v1/web/general/search/single` — 综合搜索
- `/aweme/v1/web/challenge/aweme` — 话题/挑战页
- `/aweme/v1/web/hot/search/video/list` — 热搜视频
- `/aweme/v1/web/music/aweme` — 音乐关联视频

修改此列表需同步改 `inject.js` 中的 `urlPatterns` 数组。

### 数据流

```
抖音 API → inject.js 拦截 → postMessage → content.js 缓存（interceptedAwemes Map）
                                               ↓
popup.js sendMessage('getData') → content.js 响应 → popup.js 更新 UI
                                               ↓
用户点击「开始爬取」 → popup.js 定时滚动 → content.js syncDOMToCache（DOM 降级）
                                               ↓
数据去重（aweme_id）→ 累积到 Handsontable 表格 → 导出 CSV/XLSX
```

## 修改指南

### 新增 API 端点拦截

1. 在 `inject.js` 中的 `urlPatterns` 数组添加正则：
   ```js
   /\/aweme\/v1\/web\/your_new_endpoint/
   ```
2. 若响应结构不同，调整 `extractAwemes(data)` 函数以递归提取 aweme 对象
3. 无需改 `content.js`，已自动处理

### 新增数据字段

当前提取 12 个字段（见 `popup.js` 中的 `columns` 数组）：
- 从 API：`aweme_id`, `author.nickname`, `author.sec_uid`, `duration`, `statistics.*`, `create_time`, `video.cover.url_list[0]`
- 从 DOM（降级）：`data-e2e` 属性或链接 `href`

**添加新字段步骤：**
1. 在 `content.js` 的 `interceptedAwemes` 处理逻辑中，从 API 响应提取新字段（若需要）
2. 在 `popup.js` 的 `columns` 数组添加列定义：
   ```js
   { data: 'new_field', title: '新字段名' }
   ```
3. 若需 DOM 降级支持，在 `content.js` 的 `douyinFields` 对象添加属性映射

### 修改滚动策略

滚动逻辑在 `popup.js` 的 `startCrawling()` 函数：
- `config.crawlDelay`：最短延迟（默认 1.5s）
- `config.waitTimeout`：等待页面响应超时（默认 20s）
- `config.noIncrementTimeout`：无新数据超时（默认 15s）
- `config.maxConsecutiveNoIncrement`：连续无新增滚动次数（默认 3 次）

修改默认值需同时改 `popup.js` 初始化逻辑和配置面板 HTML。

### 批量搜索逻辑

核心函数 `executeBatchSearch()` 在 `popup.js`：
1. 解析 CSV/XLSX，提取「关键词」列
2. 遍历关键词，对每个执行：
   - 更新 URL 到搜索页
   - 触发 `chrome.tabs.update`
   - 等待 `getData` 返回数据
   - 调用 `startCrawling()`
   - 爬取完成后保存单个 CSV（若选择了本地目录）
3. 全部完成后提供「下载合并CSV」按钮

修改此流程需注意 `chrome.tabs` API 的异步回调和 Tab 切换时的状态隔离。

## 常见问题

### 为什么没有检测到数据？

1. **检查 inject.js 是否注入成功**：
   - 打开抖音页面，F12 → Console
   - 输入 `window.__DOUYIN_INJECTED__`，应返回 `true`
   
2. **检查 API 是否被拦截**：
   - Console 中应有 `[DouyinURL] Intercepted:` 日志
   - 若无，可能抖音更新了 API 路径，需更新 `urlPatterns`

3. **检查 content.js 是否收到数据**：
   - Console 中应有 `[DouyinURL Content] Received N awemes` 日志
   - 若有拦截但无收到，检查 `postMessage` 的 `targetOrigin`

### 如何添加新的抖音页面支持？

1. 访问目标页面，F12 → Network，筛选 XHR/Fetch
2. 找到返回视频列表的 API（通常包含 `aweme_list` 或 `aweme_info`）
3. 在 `inject.js` 添加 URL 匹配规则
4. 测试该 API 响应结构是否能被 `extractAwemes` 正确解析

### 如何调试 Service Worker？

`background.js` 在 Service Worker 环境运行，无法直接用页面 Console：
1. 访问 `chrome://extensions/`
2. 找到扩展，点击「Service Worker」链接（蓝色下划线）
3. 在弹出的 DevTools 中查看日志

### 为什么导出文件不在指定目录？

检查 `chrome.downloads.download()` 权限：
- `manifest.json` 中必须有 `"downloads"` 权限
- 若用户禁用了下载提示，可能被浏览器拦截

## 版本发布

当前版本 **v1.2.0**，发布新版本流程：

1. 修改 `manifest.json` 中的 `version` 字段
2. 更新 `README.md` 版本历史，说明变更内容
3. 提交 commit，使用格式：
   ```
   chore: bump version to x.x.x
   feat: add xxx
   fix: resolve xxx
   ```
4. 无需 npm publish 或构建，直接打包源码目录为 ZIP 上传到 Chrome Web Store（若需发布）

## 依赖库

位于 `lib/` 目录，所有为 CDN 下载的压缩版本，无需安装：
- jQuery 3.1.1 — DOM 操作
- Handsontable — 表格预览与编辑
- PapaParse — CSV 解析与生成
- FileSaver.js — 已废弃（v1.2.0 改用 chrome.downloads API）
- XLSX.js (SheetJS) — Excel 导入导出
- js-sha256 — 用于检测表格变化（去重）

升级依赖需手动下载新版本到 `lib/`，并更新 `manifest.json` 和 `popup.html` 中的引用路径。

## 用户体验原则

- **零配置启动**：打开抖音页面，点击扩展图标，数据应立即显示
- **自动停止**：用户不应手动判断「是否爬完」，系统检测无新增时自动停止
- **批量任务透明**：进度面板实时显示当前关键词、已完成数、失败数，可随时取消
- **导出无摩擦**：一键下载到固定子目录，避免每次选择路径

修改交互逻辑时，优先考虑「用户是否需要思考」，能自动化的不手动。
