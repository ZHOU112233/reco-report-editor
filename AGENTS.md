# AGENTS.md — 给 Codex / 其他 AI 助手的操作说明

## 这是什么
猎头顾问用的「推荐报告编辑器」。**整个程序就是根目录的一个文件 `index.html`**（HTML + CSS + JS 全在里面），没有构建步骤、没有后端、没有依赖安装。
线上地址（GitHub Pages，自动跟随 main 分支）：https://zhou112233.github.io/reco-report-editor/

功能：上传候选人简历（PDF / Word / TXT）→ 按原排版带入文档 → 按客户模板自动填推荐语字段 → 富文本编辑 → 导出 PDF / Word。

## 怎么运行
- 直接用 Chrome 打开 `index.html` 即可：`open index.html`
- 首次解析 PDF / Word 需要联网（pdf.js 与 mammoth 从 jsDelivr 加载）。

## 怎么改
1. 只改 `index.html`。改完用 Chrome 打开确认。
2. 自动化验证：`tools/check.sh <某份简历.pdf> [模板id]`，会用无头 Chrome 上传该 PDF、套模板、打印每个字段是否自动填入，并截图到 `tools/last-check.png`。
3. 发布：`./publish.sh "一句话说明改了什么"`（提交并推送，GitHub Pages 一两分钟后更新）。

## 代码地图（都在 index.html 里，按出现顺序）
- `<style>`：界面样式；`@media print` 是导出 PDF 时的样式；`#pageCss` 由 JS 动态写入 `@page` 尺寸。
- 左侧 `<aside class="side">`：资料来源（上传、删除简历）、推荐模板列表 `#tplList`、文件信息。
- 右侧 `#paper`：文档标题 `#docTitle`、推荐语字段 `#fields`、分页符、原始简历 `#resumeDoc`（contenteditable）。
- `const TPLS=[...]`：六套内置客户模板（小红书 / 神龙岗 / 歌尔岗 / 今日宜休 / 腾讯云 / 美团）。字段可以是字符串，或 `{l:字段名,h:提示}`。
- `const SYN={...}`：字段同义词表，`lookup(label)` 用它把模板字段名映射到简历里抽取的值。
- `let S=load()||…`、`save()`：全部状态存浏览器 localStorage，键名 `reco_editor_v4`。改了状态结构要升键名并在 `load()` 里做迁移。
- `initTpls / allTpls / editTpl / newTpl / tdSave`：模板可编辑、可新建，存在 `S.tpls`。
- `tdParseText / tdRecognize / tdFromFile`：新建模板时把客户发来的要求原文（粘贴或上传 .txt/.docx/.pdf）拆成字段：编号行=字段，「名：说明」拆为字段名与提示，「注意：」行进说明，首行无编号当模板名。改解析规则只改 `tdParseText`。
- `applyTpl / renderTplList / toggleTplField`：套模板、逐字段勾选。
- `snap / pushUndo / undo / redo`：撤销栈（JSON 快照）。
- `fmt / bubble / brush / unifySize / insertBreak`：富文本工具栏、浮动工具条、格式刷、统一字号、分页符。
- `pageSetup / applyPageSize`：页面尺寸跟随简历 PDF（无 PDF 则 A4）。
- `docHtml / exportPdf / exportWord`：导出。Word 导出把字段、分栏、头像都转成表格（Word 不认 float / grid）。
- `pdfToHtml`（含 `fixRad`、`inkColor`、`snapColor`）：pdf.js 取文字项 + 渲染页面采样颜色 + 定位图片，重建成带字号 / 颜色 / 分栏 / 段落的 HTML。
- `extract / harvestLine / lookup`：从简历文字抽字段（键值对、日期区间、工作 / 教育经历、组合字段）。
- `handleFile`：上传入口，按扩展名分流到 pdf / docx / txt。

## 约定
- 保持单文件，不要拆成多文件或引入打包工具。
- 外部脚本只从 jsDelivr / cdnjs 加载，并写死版本号。
- 不要往仓库里放任何候选人简历或个人信息；测试用的 PDF 放在仓库外（例如 ~/Downloads）。
- 简历里没有的信息一律留「待补充」，不要编造。
- 改动后必须跑一次 `tools/check.sh` 并自己看截图，再 `./publish.sh`。
