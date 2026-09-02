# 大学生成长档案网站 Skill

这是一个可分享的 Codex Skill 包，用于生成和维护大学生个人成长电子档案网站。

## 包含内容

- `SKILL.md`：Skill 的触发条件、生成规则和验收要求
- `agents/openai.yaml`：Codex 界面显示信息
- `assets/index.html`：已经搭建好的单文件网页模板，包含搜索、筛选、时间线、简历素材、JSON 备份和文件附件功能

## 给其他人的使用方式

将整个 `college-ai-archive-builder` 文件夹复制到：

```text
~/.codex/skills/college-ai-archive-builder/
```

然后在 Codex 中新开一轮对话，使用：

```text
$college-ai-archive-builder 帮我建立大学个人成长档案库。
```

也可以直接双击 `assets/index.html` 使用现成网页，不需要安装 Node、Python、数据库或服务器。

## 附件与备份说明

每条经历可以添加多个证明材料。文字记录保存在浏览器 `localStorage`，原始附件保存在浏览器 `IndexedDB`，在记录详情中可直接打开或下载。

网页的 JSON 导出用于备份结构化记录，不包含原始附件文件。重要证书、扫描件和作品原件请另存到电脑或网盘；清理浏览器数据可能导致网页中的本地数据和附件丢失。

