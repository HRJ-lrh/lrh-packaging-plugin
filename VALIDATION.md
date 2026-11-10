# v1.1.0 验证记录

日期：2026-11-10。以下为本发布包的实际检查范围，不继承其他版本或上游的成片验收。

## 已执行

- Skill frontmatter 与命名验证通过；本地文档链接检查、私有路径/凭据签名检查、发行文件范围检查通过。
- 6 项自动化测试通过：路径别名启动、缺失工程拒绝、损坏归档拒绝、已有目录不覆盖、校验失败清理临时解压目录、错误参数在安装前退出。
- 从公开提交 `23ccf5e28e59bf030a6ccc9f174bf2bb260b3c8b` 导出 Agent Motion 源码，未读取本地未提交生产文件。排除 `docs/media/`，保留原许可/通知/字体许可；224个原始文件加来源清单，校验锁定归档及解压后每个源文件。
- 完整安装ZIP解压到系统临时目录后，使用包内归档离线获取引擎源码通过；覆盖含空格路径与macOS路径别名。
- 在独立、含空格的目录获取运行源码。执行上游 bootstrap，Node依赖安装、Python环境创建、模型校验、实际RVM CPU推理、前景/遮罩编码解码和Chromium WebGL2诊断通过。
- 本次环境：macOS arm64、Node 26.5.1、FFmpeg/ffprobe 8.1.2、ONNX Runtime 1.22.1。第一次 uv 网络下载超时；重试复用了已下载并由上游脚本校验的 uv 和模型缓存、现有 Chromium 缓存。不能称为全部依赖从零联网下载成功。
- 原创示例实际渲染为1280×720、60fps、8秒、480帧 H.264 MP4；浏览器无页面错误、前后随机定位确定性、帧数/尺寸/帧率与完整解码检查通过。

## 视觉检查与边界

示例关键状态及交接连续抽帧用于检查对象缩放、聚合、阅读位置和字幕稳定；这不是完整正常速度观看记录。示例无声音、真实人物或口播，不验证真人抠像边缘、语音同步、音乐听感或V6等价质量。视听与用户验收保持独立，不能把此示例的技术通过记为新片已验收。

此次没有在另一台物理电脑、Windows或Linux实际安装本迁移包；兼容性描述来自锁定上游文档，不冒称本版已做跨平台实机验证。默认720p示例不证明4K渲染已测试；真实项目须另做本期规格及素材验证。

## 可复跑命令

在仓库根运行：

```sh
node --test tests/runtime.test.mjs
node --check skills/lrh-packaging-plugin/scripts/runtime.mjs
node --check skills/lrh-packaging-plugin/scripts/render-demo.mjs
python3 scripts/build-release.py
```

打包命令需先把与 `runtime.lock.json` 匹配的运行源码归档放入 `dist/`。Skill端的安装与渲染命令见[运行说明](skills/lrh-packaging-plugin/references/runtime.md)。诊断结果和示例帧写在使用者自选输出目录，不将带本机路径的日志打进公开包。
