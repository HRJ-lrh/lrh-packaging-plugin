import Cocoa

let home = FileManager.default.homeDirectoryForCurrentUser.path
let workspace = ProcessInfo.processInfo.environment["LRH_WORKSPACE"] ?? home + "/Documents/ChatGPT/HRJ"
let skill = (ProcessInfo.processInfo.environment["CODEX_HOME"] ?? home + "/.codex") + "/skills/lrh-packaging-plugin/SKILL.md"
class Launcher: NSObject, NSApplicationDelegate {
 var window: NSWindow!
 let titleField = NSTextField(string: "新一期科技口播")
 let format = NSPopUpButton()
 let script = NSTextView()
 let requirements = NSTextView()
 let status = NSTextField(labelWithString: "素材保留在原位置；任务自动保存到 HRJ 工作区。")
 var files: [String: [URL]] = [:]
 var labels: [String: NSTextField] = [:]
 func applicationDidFinishLaunching(_ notification: Notification) {
  let menu = NSMenu()
  let appItem = NSMenuItem(); menu.addItem(appItem); let appMenu = NSMenu(); appItem.submenu = appMenu; appMenu.addItem(withTitle:"退出",action:#selector(NSApplication.terminate(_:)),keyEquivalent:"q")
  let editItem = NSMenuItem(); menu.addItem(editItem); let editMenu = NSMenu(title:"编辑"); editItem.submenu = editMenu
  for (name, sel, key) in [("剪切","cut:","x"),("复制","copy:","c"),("粘贴","paste:","v"),("全选","selectAll:","a"),("撤销","undo:","z")] { editMenu.addItem(withTitle:name,action:Selector(sel),keyEquivalent:key) }
  NSApp.mainMenu = menu
  window = NSWindow(contentRect: NSRect(x: 0,y: 0,width: 740,height: 760),styleMask: [.titled,.closable,.miniaturizable,.resizable],backing: .buffered,defer: false)
  window.title = "LRH · 口播制作启动器"
  let stack = NSStackView(); stack.orientation = .vertical; stack.alignment = .leading; stack.spacing = 14; stack.translatesAutoresizingMaskIntoConstraints = false
  window.contentView!.addSubview(stack)
  NSLayoutConstraint.activate([stack.leadingAnchor.constraint(equalTo: window.contentView!.leadingAnchor,constant: 28),stack.trailingAnchor.constraint(equalTo: window.contentView!.trailingAnchor,constant: -28),stack.topAnchor.constraint(equalTo: window.contentView!.topAnchor,constant: 24)])
  let heading = NSTextField(labelWithString: "把素材交给你的制作流程"); heading.font = .boldSystemFont(ofSize: 25); stack.addArrangedSubview(heading)
  stack.addArrangedSubview(NSTextField(labelWithString: "选择素材 → 填写要求 → 打开客户端并粘贴任务"))
  titleField.placeholderString = "本期名称"; stack.addArrangedSubview(titleField); titleField.widthAnchor.constraint(equalTo: stack.widthAnchor).isActive = true
  format.addItems(withTitles: ["竖屏 9:16", "横屏 16:9", "横竖双版"]); stack.addArrangedSubview(format)
  for kind in ["视频", "文案文件", "背景音乐"] {
   let row = NSStackView(); row.spacing = 12
   let button = NSButton(title: "选择" + kind, target: self, action: #selector(selectFiles(_:))); button.identifier = NSUserInterfaceItemIdentifier(kind)
   let label = NSTextField(labelWithString: "未选择"); label.lineBreakMode = .byTruncatingMiddle; label.maximumNumberOfLines = 2; labels[kind] = label
   row.addArrangedSubview(button); row.addArrangedSubview(label)
   let clear = NSButton(title: "清空",target:self,action:#selector(clearFiles(_:))); clear.identifier = button.identifier; row.addArrangedSubview(clear)
   stack.addArrangedSubview(row); row.widthAnchor.constraint(equalTo: stack.widthAnchor).isActive = true
  }
  addEditor("口播文案（可直接粘贴，也可选择文件）",script,110,stack)
  addEditor("本期要求（风格、参考、局部修改范围等）",requirements,95,stack)
  let note = NSTextField(wrappingLabelWithString: "沿用 lrh-packaging-plugin 的现行规则。未提供音乐时不会自行选曲。点击后会复制完整任务并打开客户端，请在 Codex 聊天中按 ⌘V 粘贴并发送。"); note.textColor = .secondaryLabelColor; stack.addArrangedSubview(note); note.widthAnchor.constraint(equalTo: stack.widthAnchor).isActive = true
  let buttons = NSStackView(); buttons.spacing = 12
  for (text, action) in [("复制任务并打开客户端",#selector(start)),("保存并复制任务",#selector(copyTask)),("打开任务文件夹",#selector(openTasks))] { buttons.addArrangedSubview(NSButton(title:text,target:self,action:action)) }
  stack.addArrangedSubview(buttons); status.maximumNumberOfLines = 3; stack.addArrangedSubview(status); status.widthAnchor.constraint(equalTo: stack.widthAnchor).isActive = true
  window.center(); window.makeKeyAndOrderFront(nil); NSApp.activate(ignoringOtherApps: true)
 }
 func addEditor(_ label:String,_ editor:NSTextView,_ height:CGFloat,_ stack:NSStackView) {
  stack.addArrangedSubview(NSTextField(labelWithString:label)); let scroll = NSScrollView(); scroll.hasVerticalScroller = true; scroll.borderType = .bezelBorder; editor.isRichText = false; editor.font = .systemFont(ofSize:14); editor.isVerticallyResizable = true; editor.autoresizingMask = [.width]; scroll.documentView = editor; stack.addArrangedSubview(scroll); scroll.widthAnchor.constraint(equalTo:stack.widthAnchor).isActive = true; scroll.heightAnchor.constraint(equalToConstant:height).isActive = true
 }
 @objc func selectFiles(_ sender:NSButton) { let kind = sender.identifier!.rawValue; let panel = NSOpenPanel(); panel.allowsMultipleSelection = true; panel.canChooseDirectories = false; if panel.runModal() == .OK { files[kind] = panel.urls; labels[kind]?.stringValue = panel.urls.map{$0.lastPathComponent}.joined(separator:"、") } }
 @objc func clearFiles(_ sender:NSButton) { let k = sender.identifier!.rawValue; files[k] = []; labels[k]?.stringValue = "未选择" }
 func task() throws -> URL {
  guard !(files["视频"] ?? []).isEmpty || !script.string.trimmingCharacters(in:.whitespacesAndNewlines).isEmpty || !(files["文案文件"] ?? []).isEmpty else { throw NSError(domain:"Launcher",code:1,userInfo:[NSLocalizedDescriptionKey:"请先选择视频或提供口播文案。"] ) }
  for url in files.values.flatMap({$0}) { guard FileManager.default.isReadableFile(atPath:url.path) else { throw NSError(domain:"Launcher",code:2,userInfo:[NSLocalizedDescriptionKey:"素材不可读取：\(url.path)"]) } }
  let dir = URL(fileURLWithPath:workspace).appendingPathComponent("outputs/launcher-tasks/\(UUID().uuidString)",isDirectory:true); try FileManager.default.createDirectory(at:dir,withIntermediateDirectories:true)
  var body = "请使用 $lrh-packaging-plugin 制作本期视频及配套封面。\n先实际读取 \(skill)、工作区 AGENTS.md 以及技能指向的现行规范和制作流程；现行规范优先于技能内的旧参数。不把准备或样段当成最终交付。\n\n本期名称：\(titleField.stringValue)\n画幅：\(format.titleOfSelectedItem ?? "竖屏")\n工作区：\(workspace)\n本期任务目录：\(dir.path)\n原始素材只读取，保留原件。\n"
  for kind in ["视频","文案文件","背景音乐"] { body += "\n\(kind)：\n" + (files[kind] ?? []).map{"- \($0.path)"}.joined(separator:"\n") + "\n" }
  body += "\n口播文案：\n\(script.string)\n\n用户本期要求：\n\(requirements.string)\n\n没有提供背景音乐时，先继续无依赖工作并询问必要输入，不自行选曲。若当前执行环境缺少工具，如实说明，不把未完成制作说成完成。\n"
  let url = dir.appendingPathComponent("制作任务.md"); try body.write(to:url,atomically:true,encoding:.utf8); return url
 }
 func fail(_ e:Error) { status.stringValue = e.localizedDescription }
 @objc func copyTask() { do { let u = try task(); NSPasteboard.general.clearContents(); NSPasteboard.general.setString(try String(contentsOf:u,encoding:.utf8),forType:.string); status.stringValue = "任务已保存并复制，可粘贴到 Codex 聊天。" } catch { fail(error) } }
 @objc func start() { do {
  let u = try task()
  NSPasteboard.general.clearContents()
  NSPasteboard.general.setString(try String(contentsOf:u,encoding:.utf8),forType:.string)
  let client = NSWorkspace.shared.urlForApplication(withBundleIdentifier:"com.openai.codex") ?? URL(fileURLWithPath:"/Applications/ChatGPT.app")
  guard FileManager.default.fileExists(atPath:client.path) else { status.stringValue = "任务已复制，但未找到客户端。请手动打开 Codex 并粘贴。"; return }
  NSWorkspace.shared.openApplication(at:client,configuration:NSWorkspace.OpenConfiguration()) { _, error in DispatchQueue.main.async {
   self.status.stringValue = error.map { "任务已复制，客户端打开失败：" + $0.localizedDescription } ?? "客户端已打开，任务已复制。请在 Codex 聊天中按 ⌘V 粘贴并发送，发送后才开始制作。"
  } }

 } catch { fail(error) } }
 @objc func openTasks() { let u = URL(fileURLWithPath:workspace + "/outputs/launcher-tasks"); try? FileManager.default.createDirectory(at:u,withIntermediateDirectories:true); NSWorkspace.shared.open(u) }
 func applicationShouldTerminateAfterLastWindowClosed(_ sender:NSApplication)->Bool { true }
}
let app = NSApplication.shared
app.setActivationPolicy(.regular)
let delegate = Launcher(); app.delegate = delegate
app.run()
