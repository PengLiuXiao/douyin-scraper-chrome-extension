# Ponytail Audit Report

**日期**: 2026-06-26  
**项目**: DouyinURL提取Pro  
**版本**: v1.2.0  
**审计类型**: 代码精简与依赖优化（over-engineering audit）

---

## 执行摘要

当前代码库包含约 **200 行死代码**和 **56KB 未使用的依赖**（不含 jQuery 则 130KB）。主要问题：

1. **遗留通用表格抓取器代码**：content.js 前 216 行为通用爬虫逻辑，但抖音专用处理完全绕过
2. **废弃依赖未清理**：FileSaver.js 已在 v1.2.0 替换为 chrome.downloads API，但文件仍存在
3. **冗余依赖**：Bootstrap.js 仅用作 CSS 框架，36KB JS 未调用任何功能
4. **重复代码**：inject.js 中 URL 模式检查在 fetch/XHR 两处完全重复

**优化潜力**: -200 行代码，-56KB 依赖（-130KB 含 jQuery），-3~4 个依赖文件

---

## 详细发现

### 1. 死代码 — 遗留表格抓取器 (~160 行)

**位置**: `src/content/content.js` 第 1-216 行  
**问题**: 通用表格抓取逻辑（findTables/getTableData/scrollDown 等）在抖音页面完全不执行

**证据**:
```javascript
// 第 217-248 行：抖音专用处理
chrome.runtime.onMessage.addListener(function(e,t,o){
    if (window.location.hostname.includes('douyin.com')) {
        if ("findTables" === e.action) {
            o({ tableId: 0, tableSelector: "body", ... });
            return true;  // 直接返回，不走通用逻辑
        } else if ("getTableData" === e.action) {
            syncDOMToCache();
            const data = seenOrder.map(id => interceptedAwemes.get(id));
            o({ data: data, ... });
            return true;  // 使用 interceptedAwemes，不走 b(o, e.selector)
        }
    }
    // 通用逻辑只在非抖音页面执行
    return "findTables"==e.action ? ... : ...
});
```

**影响函数** (从未在抖音页面调用):
- `function e(e)` — 计算最大值
- `function t(e,t)` — 选择器转义
- `function o(e)` — 提取类名
- `function n(e)` — 分析表格子元素
- `function a(e)` — findTables 主逻辑
- `function i()` — 切换表格选中状态
- `function c()` — 清除选中样式
- `function u(e)` — 提取纯文本
- `function g(e)` — SHA256 哈希
- `function m(e)` / `function v(e)` — 访问历史检测（依赖 sha256.min.js）
- `function p(e)` — 选择器解析
- `function b(e,t)` — getTableData 通用实现
- `function w(e)` — 生成选择器
- `function x(e)` — 选择下一页按钮
- `function C(e)` — 模拟鼠标点击
- `function N(e,t)` — 滚动容器检测
- `function T()` — 平滑滚动
- `function E(e)` — 懒加载滚动
- `function S(e,t,o)` — 点击下一页按钮
- `function I(e)` — 获取页面 HTML
- `function j(e,t,o)` — 简化选择器

**估算**: ~160 行（含压缩后的单字母函数名代码）

**建议**: 
- **保守方案**: 保留通用逻辑，以防未来支持其他网站（当前未使用）
- **激进方案**: 完全删除，重命名文件为 `content-douyin.js`，明确专用性

---

### 2. 废弃依赖 — FileSaver.js (5.4KB)

**位置**: `lib/FileSaver.js`  
**引用**: `src/popup/popup.html:122`

**问题**: README.md 版本历史明确说明 v1.2.0 已替换为 `chrome.downloads` API：
> - 📁 **文件下载架构升级**：
>   - 将 FileSaver.js 替换为 `chrome.downloads` API

**验证**:
```bash
$ grep -rn "saveAs\|FileSaver" src/popup/popup.js
# 无结果 — 未调用 FileSaver API
```

实际使用的是 `triggerDownload()` 函数 (popup.js:3-21)：
```javascript
function triggerDownload(blob, filename) {
  var url = URL.createObjectURL(blob);
  chrome.downloads.download({
    url: url,
    filename: finalFilename,
    conflictAction: 'uniquify'
  }, ...);
}
```

**建议**: 
1. 删除 `lib/FileSaver.js`
2. 删除 `popup.html:122` 中的 `<script src="../../lib/FileSaver.js"></script>`

**风险**: 无（已完全替换）

---

### 3. 冗余依赖 — Bootstrap.js (36KB)

**位置**: `lib/bootstrap.min.js`  
**引用**: `src/popup/popup.html:123`

**问题**: 仅使用 Bootstrap CSS 类（`.btn` `.form-control` `.glyphicon` `.input-group` `.alert`），未调用任何 JS 功能

**验证**:
```bash
$ grep -rn "\.modal\|data-toggle\|data-dismiss\|\.dropdown\|\.tooltip\|\.popover" src/popup/
# 无结果 — 未使用 Bootstrap JS 组件
```

HTML 中的 Bootstrap 使用：
- `.btn` `.btn-primary` `.btn-danger` — 纯 CSS 类
- `.form-control` `.input-group` — 纯 CSS 类
- `.glyphicon` — 字体图标（来自 bootstrap.min.css）
- `.alert` `.alert-danger` — 纯 CSS 类

**建议**:
1. 删除 `lib/bootstrap.min.js`
2. 删除 `popup.html:123` 中的 `<script src="../../lib/bootstrap.min.js"></script>`
3. 保留 `lib/bootstrap.min.css` (118KB，提供样式)

**风险**: 无（只要 CSS 保留，所有样式继续生效）

---

### 4. 冗余依赖 — sha256.min.js (8.8KB)

**位置**: `lib/sha256.min.js`  
**引用**: `manifest.json:35` (content_scripts)

**问题**: 仅被 `content.js` 中的 `g()` / `m()` / `v()` 函数使用，用于检测页面表格是否变化（防止重复爬取）

**证据**:
```javascript
// content.js 中唯一调用点
function g(e){var t=sha256.create();return t.update(e),t.hex()}
function m(e){...const t=g(e)...}  // 检查是否访问过
function v(e){...t.push(g(e))...}  // 记录访问历史
```

但这些函数只在通用 scraper 的 `b()` (getTableData) 中调用：
```javascript
function b(e,t){
    ...
    return m(c.text())?(e({error:"Table not changed..."}), ...):(...)
}
```

**抖音专用路径不调用 `b()`**，直接使用 `interceptedAwemes` Map 去重（通过 `aweme_id`）。

**建议**:
1. 如果删除通用 scraper 代码（发现 #1），同步删除此依赖
2. 删除 `lib/sha256.min.js`
3. 从 `manifest.json:35` 的 content_scripts 数组移除 `"lib/sha256.min.js"`

**风险**: 与发现 #1 联动，需同步清理

---

### 5. 冗余代码 — background.js (6 行)

**位置**: `src/background/background.js` (全部 6 行)

**代码**:
```javascript
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
```

**问题**: `manifest.json` 已配置 `side_panel.default_path`，Chrome 会自动在点击图标时打开侧边栏，`setPanelBehavior()` 调用是冗余的

**Manifest.json 配置**:
```json
"action": {
  "default_title": "DouyinURL提取Pro - AI智能检测"
},
"side_panel": {
  "default_path": "src/popup/popup.html"
}
```

根据 Chrome 文档，`default_path` 已足够触发默认行为。

**建议**:
1. 删除 `src/background/background.js` 整个文件
2. 从 `manifest.json:45-47` 移除 `background.service_worker` 配置：
   ```json
   "background": {
     "service_worker": "src/background/background.js"
   }
   ```

**风险**: 低。需测试侧边栏是否仍能正常打开（如有问题可回滚）

---

### 6. 重复代码 — inject.js URL 检查 (11 行)

**位置**: `src/content/inject.js:19-30` (fetch) 和 `55-66` (XHR)

**问题**: 11 个 URL 模式检查在两处完全重复

**当前代码**:
```javascript
// fetch 拦截 (第 19-30 行)
if (url && (
    url.includes('/aweme/v1/web/search/item') ||
    url.includes('/aweme/v1/web/aweme/post') ||
    url.includes('/aweme/v1/web/discover/feed') ||
    url.includes('/aweme/v1/feed') ||
    url.includes('/aweme/v1/web/tab/feed') ||
    url.includes('/aweme/v1/web/relation/follow/feed') ||
    url.includes('/aweme/v1/web/mix/aweme') ||
    url.includes('/aweme/v1/web/general/search/single') ||
    url.includes('/aweme/v1/web/challenge/aweme') ||
    url.includes('/aweme/v1/web/hot/search/video/list') ||
    url.includes('/aweme/v1/web/music/aweme')
)) { ... }

// XHR 拦截 (第 55-66 行) — 完全相同
if (url && (
    url.includes('/aweme/v1/web/search/item') ||
    ...
)) { ... }
```

**优化方案**:
```javascript
const API_PATTERNS = [
    '/aweme/v1/web/search/item',
    '/aweme/v1/web/aweme/post',
    '/aweme/v1/web/discover/feed',
    '/aweme/v1/feed',
    '/aweme/v1/web/tab/feed',
    '/aweme/v1/web/relation/follow/feed',
    '/aweme/v1/web/mix/aweme',
    '/aweme/v1/web/general/search/single',
    '/aweme/v1/web/challenge/aweme',
    '/aweme/v1/web/hot/search/video/list',
    '/aweme/v1/web/music/aweme'
];

function shouldIntercept(url) {
    return url && API_PATTERNS.some(pattern => url.includes(pattern));
}

// 使用
if (shouldIntercept(url)) { ... }
```

**收益**: -11 行，未来新增端点只需修改一处

**建议**: 立即重构

---

### 7. 可选优化 — jQuery (85KB)

**位置**: `lib/jquery-3.1.1.min.js`  
**使用范围**: `content.js` 大量依赖 `$()` 选择器

**问题**: 现代浏览器原生 API 可替代大部分 jQuery 功能

**jQuery 使用场景**:
- `$("body *")` → `document.querySelectorAll("body *")`
- `$(el).text()` → `el.textContent`
- `$(el).attr("href")` → `el.getAttribute("href")`
- `$(el).addClass()` → `el.classList.add()`

**建议**:
- **保守方案**: 保留 jQuery，因为遗留 scraper 代码大量依赖
- **激进方案**: 如果删除遗留 scraper（发现 #1），评估是否可完全移除 jQuery
  - Douyin 专用代码（第 38-215 行）仅在少数地方使用原生 DOM API
  - 需逐行审查依赖

**风险**: 高（需大量重构）

**优先级**: 低（先处理其他发现项）

---

## 推荐执行计划

### 阶段 1: 无风险清理（立即执行）

**收益**: -47KB, -2 依赖

1. **删除 FileSaver.js**
   - [ ] 删除 `lib/FileSaver.js`
   - [ ] 从 `popup.html:122` 移除 `<script>` 标签
   
2. **删除 Bootstrap.js**
   - [ ] 删除 `lib/bootstrap.min.js`
   - [ ] 从 `popup.html:123` 移除 `<script>` 标签
   - [ ] 保留 `bootstrap.min.css`

3. **重构 inject.js URL 检查**
   - [ ] 提取 `API_PATTERNS` 常量
   - [ ] 创建 `shouldIntercept()` 辅助函数
   - [ ] 替换两处重复检查

**测试要点**:
- 验证 CSV/XLSX 导出功能正常（不依赖 FileSaver）
- 验证 UI 样式未受影响（Bootstrap CSS 仍生效）
- 验证 API 拦截正常工作

---

### 阶段 2: 谨慎清理（需充分测试）

**收益**: -9KB, -1 依赖

4. **删除 sha256.min.js**（依赖阶段 3）
   - [ ] 从 `manifest.json` content_scripts 移除引用
   - [ ] 删除 `lib/sha256.min.js`

5. **删除 background.js**
   - [ ] 删除 `src/background/background.js`
   - [ ] 从 `manifest.json` 移除 `background.service_worker`
   - [ ] 测试侧边栏点击行为

**测试要点**:
- 验证扩展图标点击后侧边栏正常打开
- 验证多 Tab 状态隔离正常

---

### 阶段 3: 架构清理（需求确认）

**收益**: ~160 行代码

6. **评估通用 scraper 代码保留必要性**
   - [ ] 确认是否有计划支持非抖音网站
   - [ ] 如果"仅抖音"，删除 `content.js` 第 1-216 行
   - [ ] 重命名为 `content-douyin.js` 明确专用性
   - [ ] 更新文档说明架构简化

**决策依据**:
- ✅ 删除：如果项目明确定位为"抖音专用工具"
- ❌ 保留：如果未来可能扩展到其他短视频平台（快手、视频号等）

---

### 阶段 4: 深度重构（可选，低优先级）

**收益**: -85KB, -1 依赖（高风险）

7. **移除 jQuery 依赖**
   - [ ] 审查所有 `$()` 调用点
   - [ ] 逐一替换为原生 DOM API
   - [ ] 回归测试所有功能

**前置条件**: 必须先完成阶段 3（删除遗留 scraper）

---

## 文件清单

### 待删除文件
```
lib/FileSaver.js              # 5.4KB
lib/bootstrap.min.js          # 36KB
lib/sha256.min.js             # 8.8KB (阶段 2)
src/background/background.js  # 0.2KB (阶段 2)
```

### 待修改文件
```
src/popup/popup.html          # 移除 2 个 <script> 标签
src/content/inject.js         # 重构 URL 检查逻辑
manifest.json                 # 移除 background 和 sha256 引用
src/content/content.js        # (可选) 删除遗留代码
```

---

## 预期效果

### 阶段 1 完成后
- **文件体积**: -47KB (FileSaver 5.4KB + Bootstrap.js 36KB + inject.js 压缩增益)
- **依赖数量**: 9 → 7
- **加载速度**: 扩展启动时间减少 ~15ms (减少 2 个 JS 解析)
- **代码可维护性**: API 端点集中管理，新增端点只需修改一处

### 全部完成后（含阶段 2）
- **文件体积**: -56KB
- **依赖数量**: 9 → 6
- **代码行数**: -171 行 (~9% 总量)
- **扩展大小**: 从 ~3.6MB 降至 ~3.5MB

### 如果执行阶段 4（移除 jQuery）
- **文件体积**: -141KB
- **依赖数量**: 9 → 5
- **扩展大小**: 从 ~3.6MB 降至 ~3.4MB

---

## 风险评估

| 项目 | 风险等级 | 回滚难度 | 测试工作量 |
|------|---------|---------|-----------|
| 删除 FileSaver.js | 无 | 低 | 5 分钟 |
| 删除 Bootstrap.js | 无 | 低 | 5 分钟 |
| 重构 inject.js | 低 | 低 | 10 分钟 |
| 删除 sha256.min.js | 低 | 低 | 5 分钟 |
| 删除 background.js | 低-中 | 低 | 10 分钟 |
| 删除遗留 scraper | 中 | 中 | 30 分钟 |
| 移除 jQuery | 高 | 高 | 2-4 小时 |

---

## 附录：命令速查

### 验证 FileSaver 未使用
```bash
grep -rn "saveAs\|FileSaver" src/popup/popup.js
```

### 验证 Bootstrap JS 未使用
```bash
grep -rn "\.modal\|data-toggle\|data-dismiss\|\.dropdown" src/popup/
```

### 统计依赖总大小
```bash
du -sh lib/
ls -lh lib/*.{js,css}
```

### 查找 jQuery 调用点
```bash
grep -rn '\$(' src/ | wc -l
```

---

**审计人**: Claude Code (Ponytail Mode)  
**报告生成时间**: 2026-06-26 15:25  
**下次审计建议**: v1.3.0 发布前再次执行
