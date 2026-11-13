# LRH Mac 制作启动器

原生 Cocoa 表单，可选择多个视频、文案文件、背景音乐，粘贴文案、填写要求，选择横屏、竖屏或双版。

## 使用

1. 从 Release 下载并解压 `LRH-Launcher-macOS.zip`，打开应用。
2. 选择素材、填写文案或要求。
3. 点击“复制任务并打开客户端”。
4. 在 Codex 客户端的本地工作区聊天中按 ⌘V 粘贴并发送。

应用只准备任务和打开客户端，不自动创建聊天或发送，不代表视频已经开始制作。若客户端未安装，仍可用“保存并复制任务”。原始素材只记录路径，不会复制、上传或修改。

## 环境

- macOS 13+；预编译附件为 Apple Silicon 版本。Intel Mac 可用下方命令本机构建。
- 已安装 Codex 客户端和 `lrh-packaging-plugin` 技能；制作能力取决于客户端中实际可用的模型、工具和素材。
- 默认工作区为 `~/Documents/ChatGPT/HRJ`；任务保存在其 `outputs/launcher-tasks/`。其他工作区可通过启动进程环境变量 `LRH_WORKSPACE` 配置，或修改源码中的默认路径后构建。
- 默认技能入口 `~/.codex/skills/lrh-packaging-plugin/SKILL.md`，支持 `CODEX_HOME`。
- 应用只有本地 ad-hoc 签名，没有 Apple 开发者公证；下载版可能受到 macOS Gatekeeper 限制。可审阅源码后本机构建。
- 关闭窗口退出，未保存表单不会自动恢复；保存的任务文件可在任务文件夹查阅。

## 构建

安装 Xcode Command Line Tools 后，在此目录运行：

```sh
bash build.sh
```

产物为 `dist/LRH 制作启动器.app` 和 `dist/LRH-Launcher-macOS.zip`。

## 验证范围

已验证本机编译、窗口打开、中文粘贴、空输入校验、任务保存、复制及客户端打开。未自动发送测试任务，未声称完成真实视频制作；未验证 Intel 或其他 Mac 上运行。
