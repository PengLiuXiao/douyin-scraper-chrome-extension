# DouyinURL提取Pro

专为抖音平台设计的 Chrome 扩展，通过 API 拦截 + DOM 智能降级，提取视频数据并支持 CSV / XLSX 导出。

## 功能特性

- 🎯 **API 智能拦截** — 直接从抖音 API 响应捕获原始数据，准确可靠
- 🎨 **抖音专用** — 专门为抖音平台优化，支持搜索、主页、关注、合集、话题等页面
- 📊 **12 个数据字段** — 视频ID、链接、标题、作者、作者ID、时长、点赞数、评论数、分享数、播放量、发布时间、封面链接
- 💾 **多格式导出** — 支持 CSV、XLSX 格式导出及一键复制
- 🔄 **自动滚动采集** — 无限滚动模式，自动翻页抓取大量数据
- 🎛️ **实时预览编辑** — Handsontable 表格预览，支持列重命名与删除

## 🛠️ 技术架构

### 数据提取机制

```
用户浏览抖音
    │
    ├─ 1️⃣ API 拦截（inject.js，MAIN world）← 主力通道
    │      拦截 fetch / XHR → 解析 JSON → postMessage → content.js
    │      覆盖 11 个 API 端点，获取完整结构化字段
    │
    └─ 2️⃣ DOM 降级（syncDOMToCache，ISOLATED world）← 备用通道
           策略一：优先 data-e2e 语义属性定位视频卡片
           策略二：降级到 a[href*="/video/"] 链接扫描
```

### 文件结构

```
douyin-url-extractor-pro/
├── manifest.json           # Chrome 扩展配置 (Manifest V3)
├── background.js           # 后台 Service Worker，监听图标点击，创建弹窗
├── inject.js               # API 拦截脚本（运行在 MAIN world）
├── content.js              # 数据处理、DOM降级、消息监听
├── content.css             # 页面高亮样式（通用模式使用）
├── popup.html              # 扩展弹窗界面
├── popup.css               # 弹窗样式
├── popup.js                # 弹窗逻辑控制器
├── icons/                  # 扩展图标（16 / 48 / 128px）
└── js/                     # 第三方库
    ├── jquery-3.1.1.min.js
    ├── sha256.min.js
    ├── bootstrap.min.css
    ├── bootstrap.min.js
    ├── handsontable.min.css
    ├── handsontable.min.js
    ├── papaparse.min.js
    ├── FileSaver.js
    └── xlsx.full.min.js
```

### API 拦截端点（11 个）

| 端点 | 对应页面 |
|------|----------|
| `/aweme/v1/web/search/item` | 搜索结果 |
| `/aweme/v1/web/aweme/post` | 用户主页视频 |
| `/aweme/v1/web/discover/feed` | 发现/推荐页 |
| `/aweme/v1/feed` | 首页信息流 |
| `/aweme/v1/web/tab/feed` | Tab 推荐 |
| `/aweme/v1/web/relation/follow/feed` | 关注页 |
| `/aweme/v1/web/mix/aweme` | 合集/系列视频 |
| `/aweme/v1/web/general/search/single` | 综合搜索 |
| `/aweme/v1/web/challenge/aweme` | 话题/挑战页 |
| `/aweme/v1/web/hot/search/video/list` | 热搜视频榜 |
| `/aweme/v1/web/music/aweme` | 音乐关联视频 |

## 🚀 安装使用

### 安装方法

1. 下载项目源码
2. 打开 Chrome 浏览器
3. 访问 `chrome://extensions/`
4. 开启「开发者模式」
5. 点击「加载已解压的扩展程序」
6. 选择项目文件夹

### 使用流程

1. **打开抖音** — 在浏览器中访问 https://www.douyin.com
2. **启动扩展** — 点击工具栏中的扩展图标
3. **自动初始化** — 扩展自动通过 API 拦截获取当前页面数据
4. **开始采集** — 点击「开始爬取」，扩展自动滚动并持续收集数据
5. **导出数据** — 点击 CSV 或 XLSX 按钮下载完整数据

### 关键词搜索（快捷方式）

在弹窗顶部「抖音关键词视频提取」区域输入关键词，点击「搜索并提取」，扩展将自动跳转到搜索页并开始采集。

## 📋 支持页面

| 页面类型 | 支持程度 | 数据来源 |
|---------|----------|---------|
| 搜索结果 | ✅ 完全支持 | API 拦截 |
| 用户主页 | ✅ 完全支持 | API 拦截 |
| 推荐/首页 | ✅ 完全支持 | API 拦截 |
| 关注页 | ✅ 完全支持 | API 拦截（新增） |
| 合集/系列 | ✅ 完全支持 | API 拦截（新增） |
| 话题/挑战页 | ✅ 完全支持 | API 拦截（新增） |
| 热搜视频榜 | ✅ 完全支持 | API 拦截（新增） |
| 音乐关联视频 | ✅ 完全支持 | API 拦截（新增） |
| 其他页面 | ⚠️ 降级支持 | DOM 解析 |

## ⚙️ 配置选项

### 爬取配置

- **最短延迟**：触发滚动的最短等待时间（秒）
- **最长等待**：等待页面响应的超时时间（秒）
- **预览限制**：弹窗内默认显示 1000 条记录，完整数据通过导出获取

### 数据字段（12 个）

| 字段 | 来源 |
|------|------|
| 视频ID | API（必有） |
| 视频链接 | 自动生成 |
| 视频标题 | API / DOM |
| 作者 | API / DOM |
| 作者ID | API |
| 时长 | API |
| 点赞数 | API / DOM |
| 评论数 | API / DOM |
| 分享数 | API |
| 播放量 | API |
| 发布时间 | API |
| 封面链接 | API |

## 📝 版本历史

### v1.0.0

- ✅ 基于 Instant Data Scraper 架构，专为抖音深度定制
- ✅ inject.js MAIN world API 拦截（11 个端点）
- ✅ 双策略 DOM 降级（data-e2e 优先 + 链接扫描兜底）
- ✅ 12 个数据字段提取（含作者ID、时长）
- ✅ CSV / XLSX / 复制全部 三种导出方式
- ✅ 关键词搜索一键跳转采集
- ✅ 全中文 UI 界面

---

**🎬 DouyinURL提取Pro** — API 级别的准确性，轻松采集抖音视频数据。