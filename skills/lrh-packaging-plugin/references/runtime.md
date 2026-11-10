# 运行环境与迁移 · v1.1.0

## 两种安装包

- `lrh-packaging-plugin-v1.1.0-full.zip`：Skill、原创示例及锁定版本的 Agent Motion 运行源码归档。推荐换电脑使用。约 53 MB；这不是依赖、浏览器和模型全部离线的安装包。
- `lrh-packaging-plugin-v1.1.0.zip` / Git 仓库：轻量 Skill、脚本和示例；`fetch` 从同一 GitHub Release 下载运行源码并核对 SHA-256。

解压后把 `lrh-packaging-plugin` 放入助手的 Skill 目录。Codex 默认是用户目录下 `.codex/skills/`；自定义 CODEX_HOME 时使用其 `skills/`。先备份同名旧目录，不合并新旧文件。引擎和每期工程应放到独立、可写的工作目录，不能写死作者的电脑路径。

## 许可与范围

Skill 自有文本、脚本和原创验证场景采用 MIT。Agent Motion 来源为 [erduo1998-cell/agent-motion](https://github.com/erduo1998-cell/agent-motion)，固定提交 `23ccf5e28e59bf030a6ccc9f174bf2bb260b3c8b`，采用 [Motion Craft Community License 1.0](https://github.com/erduo1998-cell/agent-motion/blob/23ccf5e28e59bf030a6ccc9f174bf2bb260b3c8b/LICENSE)：公开授权限非商业用途，商业使用须取得上游授权。不能移除或用本仓库 MIT 覆盖其 LICENSE、NOTICE 与第三方许可。

运行源码取自该公开提交，代码未修改；排除 `docs/media/` 的上游演示媒体，新增 `LRH-SOURCE.json` 记录来源与逐文件哈希。没有作者个人原片、私人参考库、BGM、历史生产工程或凭据。上游字体保留各自许可；抠像模型由安装器下载并保留自身许可。普通浏览器示例不代表真人、头发、遮罩和语音同步已验证。

## 首次启动

准备 Node.js 22+（包含 npm）和系统 `tar`。macOS、常见 Linux 及现代 Windows 通常提供 tar；用 `tar --version` 检查。Windows 在终端直接运行下面的 Node 命令，不需要 Bash。命令中的引擎路径是示例，替换为自己的工作目录。

在 **Skill 文件夹**运行：

```sh
node scripts/runtime.mjs fetch --engine "../lrh-agent-motion"
node scripts/runtime.mjs setup --engine "../lrh-agent-motion"
node scripts/runtime.mjs check --engine "../lrh-agent-motion"
node scripts/render-demo.mjs --engine "../lrh-agent-motion" --out "../lrh-demo-check"
```

`fetch` 优先使用完整包内的源码归档，否则下载；先检查大小和 SHA-256，再解压并校验源文件。遇到已有目录直接退出，不覆盖它。也可 `fetch --engine PATH --archive FILE` 使用单独下载的同版本归档。不要把不同版本文件混合后跳过校验。

`setup` 调用该工程自己的 `scripts/bootstrap.mjs`，联网安装锁定 Node 依赖、Chromium、项目私有 Python 与抠像依赖/模型，并执行诊断。先阅读引擎的 `AGENTS.md`、`docs/getting-started.md` 和 `LICENSE`；已授权且适用的安装直接继续。支持范围以该版本 `docs/compatibility.md` 为准：原生 Windows ARM64 抠像不受支持，不能报告为已兼容。

`check` 验证工程结构并运行 `doctor --matting`。文件存在检查与实际运行分开记录；来源收据不证明用户后来修改过的源码仍与上游完全一致。

`render-demo` 从本包复制原创场景到引擎的 `work/lrh-check-*`，导出默认 1280×720、60fps、8 秒无声 MP4，保留源代码、连续帧和 `verification.json`。`--width 3840` 可检查4K渲染；默认720p验证不能冒称通过4K测试。输出目录必须是新目录。检查画面按[质量指南](quality.md)，不要修改报告把未看的视听项标为通过。

首次下载失败时可改用完整发行包；安装具体依赖失败时保留错误并修复该项。不能因为网络错误擅自跳过浏览器、人物层或质量检查，转而生成较简陋的全片。缺少视听能力时交付状态保持“待检查预览”。

## 已有 Agent Motion 工程

不必重新下载或覆盖。显式传入其路径运行 `check`；记录当前 Git 提交、未提交修改或来源收据，并读取那个工程自己的规则。结构兼容不代表与锁定发行包完全相同。运行示例后再用本期真实人物、选定字体和复杂背景检验代表段落。字体替换后重新核查长句、字重、外伸与边界。

实际制作在引擎的独立 `work/本期名称/` 内完成。原片及 SRT 放入用户指定位置；保留原声、语序和时间，除非已授权重剪。按工程本地 SRT 技能形成分析，再由 Motion Craft 按阶段完成构图、动画、声音和检查。使用项目的阶段读取入口，不能把读过 Skill 名称当作完整执行。

## 与其他实现的分工

Python、ASS/libass、FFmpeg 可继续承担转写整理、字幕、素材处理和最终合成。主UI若要求统一空间、材质、视差和对象交接，应由能实际表现这些关系的场景实现。用户指定其他宿主时按同样画面目标验证，不为了工具名称迁移合格工程。工具链说明须指向实际源码、命令和输出；不要用安装清单冒充执行日志。
