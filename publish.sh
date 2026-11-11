#!/bin/zsh
# 发布到 GitHub Pages。用法：./publish.sh [提交备注]
# 仓库里的 index.html 和桌面上的「推荐报告编辑器-Demo.html」以较新的一份为准，先同步再提交推送。
set -e
cd "$(dirname "$0")"
SRC="$HOME/Desktop/推荐报告编辑器-Demo.html"
if [ -f "$SRC" ]; then
  if [ "$SRC" -nt index.html ]; then cp "$SRC" index.html; echo "已用桌面文件更新 index.html"; else cp index.html "$SRC"; fi
fi
if git diff --quiet && [ -z "$(git status --porcelain)" ]; then echo "没有变化，无需发布"; exit 0; fi
git add -A
git commit -q -m "${1:-更新编辑器 $(date '+%Y-%m-%d %H:%M')}"
git push -q
echo "已推送，一两分钟后生效：https://zhou112233.github.io/reco-report-editor/"
