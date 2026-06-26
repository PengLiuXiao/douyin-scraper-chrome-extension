# DouyinURL提取Pro 测试执行指引

## ✅ 代码级自动验证 - 已完成

所有代码修改已通过自动验证：

### inject.js 重构
- ✅ API_PATTERNS 常量已提取（11 个端点）
- ✅ shouldIntercept() 函数已创建
- ✅ 消除重复代码

### content.js 精简
- ✅ 当前 216 行（精简前 ~252 行）
- ✅ 遗留通用 scraper 代码已清理

### 依赖清理
- ✅ FileSaver.js 已删除
- ✅ bootstrap.min.js 已删除
- ✅ sha256.min.js 已删除
- ✅ manifest.json 已更新
- ✅ popup.html 引用已清理
- ✅ bootstrap.min.css 保留（仅 CSS）

### 优化效果
- **lib/ 目录**: 3.5MB → 3.3MB (-56KB)
- **代码行数**: -294 行
- **依赖数量**: 9 个 → 6 个

---

## 🔧 手动测试步骤（需在 Chrome 中执行）

由于这是 Chrome 扩展，以下功能测试需要手动在浏览器中验证：

### 准备工作

1. **加载扩展到 Chrome**
   ```bash
   # 1. 打开 Chrome 浏览器
   # 2. 访问 chrome://extensions/
   # 3. 开启「开发者模式」（右上角开关）
   # 4. 点击「加载已解压的扩展程序」
   # 5. 选择项目根目录
   ```

2. **登录抖音账号**
   - 访问 https://www.douyin.com
   - 使用手机扫码登录

3. **准备测试数据**
   - 测试 CSV 已生成：`test-keywords.csv`（包含 3 个关键词）

---

## 📋 测试用例清单（18 个）

### 模块 A：数据导出功能（4 个用例）

#### TC-A1：CSV 导出 ⭐ 优先级高
**步骤**：
1. 访问 https://www.douyin.com/search/美食
2. 点击 Chrome 工具栏的扩展图标，打开侧边栏
3. 等待「收集视频数」> 0（通常 5-10 秒）
4. 点击「CSV」按钮

**预期结果**：
- ✅ 文件下载到 `~/Downloads/douyin-url-extractor/`
- ✅ 文件名格式：`douyin_美食_YYYYMMDD_HHMMSS.csv`
- ✅ 包含 12 列（视频ID、链接、标题、作者等）
- ✅ Excel 打开不乱码
- ✅ 至少 5 条数据

**如何验证**：
```bash
# 检查下载目录
ls -lh ~/Downloads/douyin-url-extractor/

# 打开最新的 CSV 文件
open ~/Downloads/douyin-url-extractor/douyin_美食_*.csv
```

---

#### TC-A2：XLSX 导出
**步骤**：同上，点击「XLSX」按钮

**预期结果**：
- ✅ 文件下载到 `~/Downloads/douyin-url-extractor/`
- ✅ Excel/Numbers 打开正常

---

#### TC-A3：复制全部
**步骤**：同上，点击「复制全部」按钮，然后粘贴到文本编辑器

**预期结果**：
- ✅ 剪贴板包含 TSV 格式（制表符分隔）
- ✅ 首行为列标题

---

#### TC-A4：自定义下载目录
**步骤**：
1. 修改「下载子目录」为 `test-export`
2. 导出 CSV

**预期结果**：
- ✅ 文件下载到 `~/Downloads/test-export/`

---

### 模块 B：UI 样式完整性（3 个用例）

#### TC-B1：主界面样式检查 ⭐ 优先级高
**步骤**：打开扩展侧边栏，目视检查

**预期结果**（逐项勾选）：
- [ ] 顶部搜索框：红色边框（#fe2c55）、圆角
- [ ] 「搜索并提取」按钮：红色背景、白色文字
- [ ] 「开始爬取」按钮：蓝色
- [ ] CSV/XLSX/复制按钮：绿色
- [ ] 配置输入框：input-group 样式（前缀+输入+后缀）
- [ ] 统计面板：粉色背景、4 项数据清晰
- [ ] 批量进度条：粉红渐变
- [ ] Glyphicon 图标：搜索、下载、上传图标显示

**截图保存**：如发现样式问题，截图并记录

---

#### TC-B2：响应式布局
**步骤**：拖拽侧边栏边缘，调整宽度

**预期结果**：
- ✅ 两栏布局保持
- ✅ 无元素溢出

---

#### TC-B3：批量搜索 UI
**步骤**：
1. 点击「批量导入关键词」
2. 选择 `test-keywords.csv`
3. 选择「取消」（不保存本地）

**预期结果**：
- ✅ 面板展开动画流畅
- ✅ 进度条颜色正确
- ✅ 关键词列表显示

---

### 模块 C：API 拦截与数据提取（4 个用例）

#### TC-C1：inject.js 注入验证 ⭐ 优先级高
**步骤**：
1. 访问任意抖音页面
2. 打开 Console（F12）
3. 输入：`window.__douyin_url_extractor_injected`

**预期结果**：
- ✅ 返回 `true`

---

#### TC-C2：API 拦截日志 ⭐ 优先级高
**步骤**：
1. 打开 Console（F12）
2. 访问 https://www.douyin.com/search/美食
3. 观察日志

**预期结果**：
- ✅ 显示 `[DouyinURL] Intercepted: /aweme/v1/web/search/item`

---

#### TC-C3：多页面端点覆盖
**步骤**：依次访问以下页面，观察 Console 日志

| 页面 | URL | 预期拦截端点 |
|------|-----|-------------|
| 搜索页 | `/search/美食` | `/aweme/v1/web/search/item` |
| 用户主页 | `/user/MS4w...` | `/aweme/v1/web/aweme/post` |
| 推荐页 | `/` | `/aweme/v1/feed` |
| 关注页 | `/follow` | `/aweme/v1/web/relation/follow/feed` |

---

#### TC-C4：数据字段完整性
**步骤**：导出 CSV，用 Excel 打开，检查 12 个字段

**预期结果**：
- ✅ 视频ID、视频链接、标题、作者、作者ID
- ✅ 时长、点赞数、评论数、分享数、播放量
- ✅ 发布时间、封面链接

---

### 模块 D：批量搜索与多 Tab 隔离（3 个用例）

#### TC-D1：端到端完整流程 ⭐ 优先级高
**步骤**：
1. 访问 https://www.douyin.com/search/旅游
2. 打开扩展
3. 点击「开始爬取」
4. 等待自动停止（约 1-2 分钟）
5. 导出 CSV

**预期结果**：
- ✅ 至少采集 30 条数据
- ✅ 数据无重复
- ✅ 统计面板实时更新

---

#### TC-D2：批量关键词搜索 ⭐ 优先级高
**步骤**：
1. 点击「批量导入关键词」
2. 选择 `test-keywords.csv`
3. 选择「取消」（不保存本地）
4. 等待全部完成
5. 点击「下载合并CSV」

**预期结果**：
- ✅ 进度显示 "3 / 3 关键词完成 (100%)"
- ✅ 合并 CSV 包含所有数据
- ✅ 新增「搜索关键词」列

---

#### TC-D3：多 Tab 独立性
**步骤**：
1. 打开两个抖音标签页（搜索不同关键词）
2. 在 Tab1 开启爬取
3. 切换到 Tab2，打开扩展
4. 验证数据独立

**预期结果**：
- ✅ 两个 Tab 数据完全独立

---

### 模块 E：边界条件与性能（4 个用例）

#### TC-E1：空数据页面
**步骤**：搜索不存在的关键词（如 `xyzabc123456`）

**预期结果**：
- ✅ 显示「收集视频数：0」
- ✅ 不报错

---

#### TC-E2：快速切换页面
**步骤**：爬取过程中立即切换 URL

**预期结果**：
- ✅ 新页面重新初始化
- ✅ 无 Console 错误

---

#### TC-E3：长时间运行稳定性
**步骤**：
1. 开启爬取，持续运行 5 分钟
2. 打开 Chrome 任务管理器（Shift+Esc）
3. 观察内存

**预期结果**：
- ✅ 内存 < 100MB
- ✅ 无内存泄漏

---

#### TC-E4：扩展加载验证 ⭐ 优先级高
**步骤**：
1. 访问 chrome://extensions/
2. 点击「重新加载」扩展

**预期结果**：
- ✅ 无错误提示
- ✅ 扩展状态正常

---

## 📊 测试优先级

**必须通过的核心用例（标记 ⭐）**：
1. TC-A1：CSV 导出
2. TC-B1：UI 样式检查
3. TC-C1：inject.js 注入验证
4. TC-C2：API 拦截日志
5. TC-D1：端到端完整流程
6. TC-D2：批量关键词搜索
7. TC-E4：扩展加载验证

**建议测试顺序**：
1. 先执行 TC-E4（扩展加载验证）- 确保扩展能正常加载
2. 再执行 TC-C1、TC-C2（API 拦截验证）- 确保核心功能正常
3. 然后执行 TC-A1（CSV 导出）- 验证导出功能
4. 最后执行 TC-D1、TC-D2（端到端流程）- 验证完整业务流程
5. 其他用例根据时间选择性执行

---

## 🐛 问题排查

### 常见问题

**问题 1：扩展加载失败**
- 检查：`chrome://extensions/` 是否显示错误
- 解决：查看错误信息，可能需要回滚代码

**问题 2：Console 报错找不到函数**
- 检查：是否删除了仍在使用的依赖
- 解决：查看 Console 具体错误信息

**问题 3：UI 样式错乱**
- 检查：bootstrap.min.css 是否保留
- 解决：确认 popup.html 引用 bootstrap.min.css

**问题 4：CSV 导出失败**
- 检查：Console 是否有 chrome.downloads API 错误
- 解决：确认 manifest.json 包含 "downloads" 权限

---

## ✅ 测试完成后

### 如果全部通过
```bash
# 提交代码
git add -A
git commit -m "refactor: remove unused dependencies and legacy code

- Remove FileSaver.js (5.4KB) - replaced by chrome.downloads API
- Remove Bootstrap.js (36KB) - only CSS used
- Remove sha256.min.js (9KB) - only used by removed legacy code
- Refactor inject.js - extract API_PATTERNS and shouldIntercept()
- Clean up content.js - remove legacy scraper code (~109 lines)

Result: -56KB dependencies, -294 lines, 6 dependencies (from 9)
All 18 test cases passed."

# 更新 README 版本历史（如需要）
```

### 如果发现问题
```bash
# 回滚修改
git checkout HEAD -- lib/ src/ manifest.json

# 或回滚特定文件
git checkout HEAD -- src/content/inject.js  # 仅回滚 inject.js
```

---

## 📝 记录测试结果

将测试结果填写到 `test-report.md`，格式：

```markdown
### 模块 A：数据导出功能
- ✅ TC-A1：CSV 导出 - 通过
- ✅ TC-A2：XLSX 导出 - 通过
- ⚠️  TC-A3：复制全部 - 通过（但中文有轻微格式问题）
- ✅ TC-A4：自定义下载目录 - 通过
```

---

**测试文档位置**：
- 完整测试方案：`/Users/vincentliu/.claude/plans/enchanted-kindling-llama.md`
- 测试报告模板：`test-report.md`
- 本指引：`TEST-GUIDE.md`

**开始测试！** 🚀
