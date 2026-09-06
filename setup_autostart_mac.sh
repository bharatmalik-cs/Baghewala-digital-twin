#!/bin/bash

# Baghewala Digital Twin - macOS Auto-Start (launchd Service) Setup
PLIST_PATH="$HOME/Library/LaunchAgents/com.baghewala.digitaltwin.plist"
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

cat << EOF > "$PLIST_PATH"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.baghewala.digitaltwin</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>${PROJECT_DIR}/start_app.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>WorkingDirectory</key>
    <string>${PROJECT_DIR}</string>
    <key>StandardOutPath</key>
    <string>${PROJECT_DIR}/app_autostart.log</string>
    <key>StandardErrorPath</key>
    <string>${PROJECT_DIR}/app_autostart_err.log</string>
</dict>
</plist>
EOF

launchctl unload "$PLIST_PATH" 2>/dev/null || true
launchctl load "$PLIST_PATH"

echo "======================================================================"
echo "   MAC OS AUTO-START SERVICE INSTALLED SUCCESSFULLY!                  "
echo "   - Digital Twin will now start automatically whenever your Mac boots"
echo "   - Local UI: http://localhost:3000                                  "
echo "======================================================================"
