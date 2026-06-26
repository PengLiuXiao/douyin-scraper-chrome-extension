#!/bin/bash
# 测试前检查脚本
echo "=== DouyinURL提取Pro 测试环境检查 ==="

# 检查文件结构
[ -f "manifest.json" ] && echo "✓ manifest.json"
[ -f "src/popup/popup.js" ] && echo "✓ popup.js"
[ -f "src/content/inject.js" ] && echo "✓ inject.js"
[ -f "src/content/content.js" ] && echo "✓ content.js"

# 确认删除的文件不存在
[ ! -f "lib/FileSaver.js" ] && echo "✓ FileSaver.js 已删除" || echo "✗ FileSaver.js 仍存在"
[ ! -f "lib/bootstrap.min.js" ] && echo "✓ bootstrap.min.js 已删除" || echo "✗ bootstrap.min.js 仍存在"
[ ! -f "lib/sha256.min.js" ] && echo "✓ sha256.min.js 已删除" || echo "✗ sha256.min.js 仍存在"

# 检查依赖大小
echo "✓ lib/ 目录大小:"
du -sh lib/

# 生成测试 CSV
cat > test-keywords.csv << 'CSV'
关键词
美食
猫咪
旅游
CSV
echo "✓ 测试 CSV 已生成: test-keywords.csv"

echo "=== 准备完成 ==="
