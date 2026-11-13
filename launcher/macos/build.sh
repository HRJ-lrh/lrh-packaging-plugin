#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
app="dist/LRH 制作启动器.app"
mkdir -p "$app/Contents/MacOS"
swiftc main.swift -o "$app/Contents/MacOS/LRHLauncher" -framework Cocoa
cp Info.plist "$app/Contents/Info.plist"
codesign --force --deep --sign - "$app"
ditto -c -k --sequesterRsrc --keepParent "$app" dist/LRH-Launcher-macOS.zip
