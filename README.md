# lrh的包装插件

科技与 AI 真人口播包装 Skill，**v1.1.0**。包含制作规范、Agent Motion 获取与环境检查脚本、可运行的原创连续动效示例，以及视觉与视听验收方法。

v1.0.1 只有规范，另一台电脑需要自行选择并搭建实现。v1.1.0 补上可复现的运行源码入口和验证路径；安装成功仍不等于自动制作出已验收成片。

## 下载与安装

从 [v1.1.0 Release](https://github.com/HRJ-lrh/lrh-packaging-plugin/releases/tag/v1.1.0) 选择：

| 文件 | 用途 |
|---|---|
| `lrh-packaging-plugin-v1.1.0-full.zip` | 推荐。Skill＋原创示例＋约53MB的锁定版本 Agent Motion 运行源码归档 |
| `lrh-packaging-plugin-v1.1.0.zip` | 轻量 Skill；首次 fetch 下载同一运行源码 |
| `agent-motion-runtime-23ccf5e.tar.gz` | 单独运行源码，适合手动下载后传入 `--archive` |
| `SHA256SUMS.txt` | 发行文件校验值 |

解压后把整个 `lrh-packaging-plugin` 文件夹放到 `~/.codex/skills/`；Windows使用用户目录下 `.codex/skills/`，自定义 CODEX_HOME 时使用其 `skills/`。先备份同名旧目录再替换，旧的 `xizi-tech-talking-head` 入口不要同时加载。重新打开会话。GitHub 仓库下载对应轻量包，不含大体积运行归档。

**完整包包含运行源码，不包含全部已安装依赖。** 首次仍需要 Node.js 22+、npm、系统 tar 和联网条件来准备浏览器、项目私有 Python、依赖及模型。没有原片、BGM、私人参考视频或API Key。

## 第一次在新电脑运行

在 Skill 文件夹运行，路径可改成自己的工作目录：

```sh
node scripts/runtime.mjs fetch --engine "../lrh-agent-motion"
node scripts/runtime.mjs setup --engine "../lrh-agent-motion"
node scripts/runtime.mjs check --engine "../lrh-agent-motion"
node scripts/render-demo.mjs --engine "../lrh-agent-motion" --out "../lrh-demo-check"
```

也可以直接让智能体执行：

> 使用 $lrh-packaging-plugin。先阅读运行说明和引擎许可，检查并准备 Agent Motion 工程，渲染附带的原创验证场景，确认实际运行能力和检查范围。然后使用我提供的原片、SRT和本期BGM制作横屏16:9科技口播。主UI按质量指南设计，不因环境缺失默默改为字幕卡片和整页翻转。

已有合格 Agent Motion 工程时跳过 fetch/setup，传入真实路径检查并复用；脚本拒绝覆盖已有目录。用户指定其他编辑器时尊重选择，仍需验证相同画面目标。

详细步骤、故障处理、系统限制及已有工程接入见[运行环境与迁移](skills/lrh-packaging-plugin/references/runtime.md)。安装器支持范围和本次实际测试范围分别记录，见[本次验证记录](VALIDATION.md)。

## 包含的能力

- [执行入口](skills/lrh-packaging-plugin/SKILL.md)：读取实际项目规则，记录真实引擎和执行证据。
- [风格规范](skills/lrh-packaging-plugin/references/style.md)与[制作流程](skills/lrh-packaging-plugin/references/workflow.md)：逐句表达、字体配色、人物取景、内部样段及全片交付。
- [视觉质量与参考迁移](skills/lrh-packaging-plugin/references/quality.md)：主信息大小、UI内容和材质、空间关系、连续交接、阅读停稳。
- [原创可运行场景](skills/lrh-packaging-plugin/assets/quality-demo/index.html)：步骤激活→合并工具→结果放大，8秒无声，人物为几何占位；附源码及渲染器。
- [素材规则](skills/lrh-packaging-plugin/references/materials.md)：实际核实 MotionGit 免费接口与许可，候选经用户选定后下载，不自选付费生成。

默认成片按确认画幅制作4K60；原始30fps人物不宣称新增真实运动细节。技术检查、完整视听和用户认可分别记录；示例默认720p60，不能冒充真人实拍、完整声音或4K成片的验证。缺少必要视听时只能交付待检查预览。代码工程不是剪映或AE原生时间线。

## 授权与来源

本仓库自有 Skill、脚本、原创示例采用 [MIT](LICENSE)。**附带的 Agent Motion 独立采用非商业许可证，商业使用需要上游授权，不受本仓库MIT授权覆盖。** 上游为 [erduo1998-cell/agent-motion](https://github.com/erduo1998-cell/agent-motion)，锁定提交 `23ccf5e28e59bf030a6ccc9f174bf2bb260b3c8b`，保留完整 LICENSE、NOTICE 与 THIRD_PARTY_NOTICES。参考[上游许可](https://github.com/erduo1998-cell/agent-motion/blob/23ccf5e28e59bf030a6ccc9f174bf2bb260b3c8b/LICENSE)。

运行归档取自公开提交，代码未修改，排除了 `docs/media/` 上游演示媒体并新增来源/哈希清单；没有打包作者本地未提交工程。字体、模型与依赖分别保留各自许可。私人V6不公开，新增示例不称为V6复制品，也不承诺仅换引擎就达到相同成片质量。
