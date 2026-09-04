# 大学生成长档案网站 Skill

这是一个可分享的 Codex Skill 包，用于生成和维护大学生个人成长电子档案网站。

## 包含内容

- `SKILL.md`：Skill 的触发条件、生成规则和验收要求
- `agents/openai.yaml`：Codex 界面显示信息
- `assets/index.html`：网页软件前端，包含搜索、筛选、时间线、简历素材、JSON 备份、账号登录和文件附件功能
- `cloud.js`：Supabase 登录、云端档案同步和私有附件存储适配层
- `supabase-config.js`：Supabase 项目配置模板
- `supabase-schema.sql`：数据库、行级权限和私有 Storage 策略

## 给其他人的使用方式

将整个 `college-ai-archive-builder` 文件夹复制到：

```text
~/.codex/skills/college-ai-archive-builder/
```

然后在 Codex 中新开一轮对话，使用：

```text
$college-ai-archive-builder 帮我建立大学个人成长档案库。
```

也可以直接双击 `assets/index.html` 使用本地演示模式；配置 Supabase 后，网页会切换为云端多用户模式。

## 启用多用户云端模式

1. 创建一个 Supabase 项目。
2. 在 Supabase SQL Editor 中运行 `supabase-schema.sql`。
3. 将 `supabase-config.js` 中的 `supabaseUrl` 和 `supabaseKey` 替换为项目的 URL 和 publishable/anon key。
4. 将整个文件夹部署到 GitHub Pages、Vercel 或其他静态网站托管平台。
5. 用户打开网站后注册或登录；每个账号只能访问自己的档案和附件。

不要把 `service_role` 密钥放入网页或公开仓库。公开仓库只能使用 Supabase 的 publishable/anon key，并依赖 SQL 中的 RLS 权限策略保护数据。

## 附件与备份说明

每条经历可以添加多个证明材料。云端模式下，文字记录保存在 Supabase 数据库，原始附件保存在私有 Supabase Storage；本地演示模式仍使用浏览器 `localStorage` 和 `IndexedDB`。

网页的 JSON 导出用于备份结构化记录，不包含原始附件文件。云端模式也建议定期下载原始附件副本；本地演示模式清理浏览器数据可能导致网页中的本地数据和附件丢失。

