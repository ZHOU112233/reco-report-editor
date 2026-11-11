#!/bin/zsh
# 用无头 Chrome 打开 index.html，上传一份 PDF，打印解析结果并截图。
# 用法：tools/check.sh <简历.pdf> [模板id: xiaohongshu|shenlong|goer|jinri|tencent|meituan]
set -e
cd "$(dirname "$0")/.."
PDF="$1"; TPL="${2:-shenlong}"
[ -f "$PDF" ] || { echo "用法：tools/check.sh <简历.pdf> [模板id]"; exit 1; }
PDF_FILE="$PDF" node tools/cdp.mjs "file://$PWD/index.html" "$(cat tools/wait_pdf.js)" \
  "(()=>{applyTplById('$TPL',true);return 'file='+S.file+' resumeChars='+S.resume.length+' imgs='+document.querySelectorAll('#resumeDoc img').length+' title='+document.getElementById('docTitle').textContent+'\n'+S.fields.map(f=>(f.html?'✓ ':'✗ ')+f.label+(f.html?' => '+f.html.replace(/<[^>]+>/g,'').slice(0,60):'')).join('\n')})()" \
  tools/last-check.png 1400 1000 120000
echo "截图：tools/last-check.png"
