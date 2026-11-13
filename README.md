# lrh的包装插件

科技与 AI 真人口播包装 Skill，**v1.2.0**。新增从作者 V6 实际工程移植的三种可运行模块：人物收窗、流程汇聚、结果接管。附素材/文案接口、渲染脚本、运行源码入口和检查方法。

v1.0.1 提供规范；v1.1.0 补齐运行环境与原创验证场景；v1.2.0 增加实际 V6 模块。安装成功仍不等于任意新口播自动达到原片效果。

## Mac 制作启动器（2026-11-13）

新增独立 Mac 应用：选择视频、文案和音乐，填写本期要求与画幅，保存任务并打开 Codex 客户端。任务自动复制到剪贴板，需在客户端聊天中粘贴并发送后开始制作。不会打开终端或自动发送任务。

[下载启动器](https://github.com/HRJ-lrh/lrh-packaging-plugin/releases/tag/launcher-v1.0.0) · [使用与构建说明](launcher/macos/README.md)

启动器独立版本，不改变下面的 v1.2.0 引擎运行包。

## 最新规范同步（2026-11-11）

主分支已同步最新[规范](skills/lrh-packaging-plugin/references/style.md)、[流程](skills/lrh-packaging-plugin/references/workflow.md)、[参考目录](skills/lrh-packaging-plugin/references/reference-catalog.md)和[横竖安全框](skills/lrh-packaging-plugin/references/safe-zones/README.md)。参考是最低质量标准；强调项须实际执行；横版字幕在底部两条线之间，竖版字幕在画面下三分线处；封面完整执行内置imagegen与三比例流程。

**现有v1.2.0 Release ZIP是此前发行快照，不含这次文档更新。** 获取最新规则请下载主分支源码，使用其中`skills/lrh-packaging-plugin`目录；运行脚本和V6模块保持原有能力。本次未重新发布运行包，未声称旧模块已按新安全框调整或完成新成片质量验收。

## 下载与安装

从 [v1.2.0 Release](https://github.com/HRJ-lrh/lrh-packaging-plugin/releases/tag/v1.2.0) 选择：

| 文件 | 用途 |
|---|---|
| `lrh-packaging-plugin-v1.2.0-full.zip` | 推荐。Skill＋V6模块＋原创示例＋约53MB的锁定版本 Agent Motion 运行源码归档 |
| `lrh-packaging-plugin-v1.2.0.zip` | 轻量 Skill；首次 fetch 下载同一运行源码 |
| `agent-motion-runtime-23ccf5e.tar.gz` | 单独运行源码，适合手动下载后传入 `--archive` |
| `v6-*-demo.mp4` | 三段几何占位的无声待检查预览；完整ZIP的`examples/`也附带这些文件 |
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

> 使用 $lrh-packaging-plugin。我要复用V6的实际效果。先核实Agent Motion运行环境和许可，读取 references/v6-modules.md，从人物收窗、流程汇聚、结果接管三个实际模块建立新工程，使用我提供的原片和SRT替换素材与文案。保留镜头和对象交接，按本期口播校准时间、人物取景与阅读停留，再对齐我提供的BGM并检查输出。记录真实使用的模块源码，不把旧的8秒原创demo当V6。

已有合格 Agent Motion 工程时跳过 fetch/setup，传入真实路径检查并复用；脚本拒绝覆盖已有目录。用户指定其他编辑器时尊重选择，仍需验证相同画面目标。

详细步骤、故障处理、系统限制及已有工程接入见[运行环境与迁移](skills/lrh-packaging-plugin/references/runtime.md)。安装器支持范围和本次实际测试范围分别记录，见[本次验证记录](VALIDATION.md)。

## 复用 V6 效果

在 Skill 文件夹执行：

```sh
node scripts/init-v6.mjs --engine "../lrh-agent-motion" --name my-workflow --module workflow-merge --config assets/v6-modules/example-content.json
node scripts/render-v6.mjs --engine "../lrh-agent-motion" --project my-workflow --out "../my-workflow-preview"
```

上面使用公开几何占位素材和替换文案，可直接验证实际模块。制作自己的片段时，在第一条命令增加 `--input "自己的口播.mp4" --start 0`，并使用新的项目名。模块保持 V6 原生时序，分别为2.50秒、11.16秒和6秒；不自动把任何口播强行变速塞入。

[模块说明与替换接口](skills/lrh-packaging-plugin/references/v6-modules.md)列出素材、字幕、人物中心、遮罩、运行命令与能力边界。原工程私有媒体没有公开；模块输出无声，声音按本期素材单独对齐。

## 包含的能力

- [执行入口](skills/lrh-packaging-plugin/SKILL.md)：读取实际项目规则，记录真实引擎和执行证据。
- [风格规范](skills/lrh-packaging-plugin/references/style.md)与[制作流程](skills/lrh-packaging-plugin/references/workflow.md)：逐句表达、字体配色、人物取景、内部样段及全片交付。
- [视觉质量与参考迁移](skills/lrh-packaging-plugin/references/quality.md)：主信息大小、UI内容和材质、空间关系、连续交接、阅读停稳。
- [V6可复用模块](skills/lrh-packaging-plugin/references/v6-modules.md)：直接移植实际工程的镜头、人物裁切、三步3D汇聚和结果分层，附原源码哈希与同源对照脚本。
- [原创可运行场景](skills/lrh-packaging-plugin/assets/quality-demo/index.html)：步骤激活→合并工具→结果放大，8秒无声，人物为几何占位；附源码及渲染器。
- [素材规则](skills/lrh-packaging-plugin/references/materials.md)：实际核实 MotionGit 免费接口与许可，候选经用户选定后下载，不自选付费生成。

默认成片按确认画幅制作4K60；原始30fps人物不宣称新增真实运动细节。技术检查、完整视听和用户认可分别记录；示例默认720p60，不能冒充真人实拍、完整声音或4K成片的验证。缺少必要视听时只能交付待检查预览。代码工程不是剪映或AE原生时间线。

## 授权与来源

本仓库自有 Skill、脚本、原创示例采用 [MIT](LICENSE)。**附带的 Agent Motion 独立采用非商业许可证，商业使用需要上游授权，不受本仓库MIT授权覆盖。** 上游为 [erduo1998-cell/agent-motion](https://github.com/erduo1998-cell/agent-motion)，锁定提交 `23ccf5e28e59bf030a6ccc9f174bf2bb260b3c8b`，保留完整 LICENSE、NOTICE 与 THIRD_PARTY_NOTICES。参考[上游许可](https://github.com/erduo1998-cell/agent-motion/blob/23ccf5e28e59bf030a6ccc9f174bf2bb260b3c8b/LICENSE)。

运行归档取自公开提交，代码未修改，排除了 `docs/media/` 上游演示媒体并新增来源/哈希清单；未将作者生产工程混入上游归档；V6自有场景代码作为独立 Skill 资源随包发布。字体、模型与依赖分别保留各自许可。V6原片、保护遮罩、声音与私人参考视频不公开。V6三个模块来自实际工程；旧的8秒原创示例仍是环境验证用例。模块移植不代表完整97秒影片或任意新片已复现。
