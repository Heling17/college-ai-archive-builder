# 大学生成长档案网站 Skill

这是一个可分享的 Codex Skill 包，用于生成和维护大学生个人成长电子档案网站。

## 包含内容

- `SKILL.md`：Skill 的触发条件、生成规则和验收要求
- `agents/openai.yaml`：Codex 界面显示信息
- `assets/index.html`：网页软件前端，包含搜索、筛选、时间线、简历素材、JSON 备份、账号登录和文件附件功能
- `sync.js`：浏览器直连用户自有 WebDAV 的同步适配层

## 给其他人的使用方式

将整个 `college-ai-archive-builder` 文件夹复制到：

```text
~/.codex/skills/college-ai-archive-builder/
```

然后在 Codex 中新开一轮对话，使用：

```text
$college-ai-archive-builder 帮我建立大学个人成长档案库。
```

也可以直接双击 `assets/index.html` 使用本地优先模式；不连接云端也能正常使用。

## 连接自己的云端

1. 用户打开网站后先在本机录入档案。
2. 在“数据备份与同步”中点击“连接我的云端”。
3. 填入自己的 HTTPS WebDAV 地址、用户名、应用密码和同步文件夹。
4. 点击“上传到我的云端”；换设备后连接同一个 WebDAV，再点击“从我的云端恢复”。

同步内容由浏览器直接发送到用户填写的 WebDAV 服务，本项目没有中心数据库，也不会接收用户档案、证书或云端密码。WebDAV 服务必须支持 HTTPS 和浏览器 CORS；建议使用应用专用密码。密码只保存在当前页面内存中，刷新页面后需要重新连接。

## 附件与备份说明

每条经历可以添加多个证明材料。文字记录和附件默认保存在当前浏览器的 `localStorage` 和 `IndexedDB`；同步时，档案 JSON 和附件直接传到用户自己的 WebDAV 文件夹。

网页的 JSON 导出用于备份结构化记录，不包含原始附件文件。WebDAV 同步会同时上传档案 JSON 和附件；仍建议用户保留第二份备份。清理浏览器数据前，应先上传到个人云端或导出备份。

