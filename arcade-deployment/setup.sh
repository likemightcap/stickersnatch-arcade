#!/bin/bash
# Sticker Snatch Arcade Cabinet Setup Script
# This script configures a Linux system to auto-boot into the game in kiosk mode

set -e  # Exit on any error

echo "=========================================="
echo "  Sticker Snatch Arcade Setup"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root (use sudo ./setup.sh)"
  exit 1
fi

# Get the actual user (not root)
ACTUAL_USER="${SUDO_USER:-$USER}"
USER_HOME=$(getent passwd "$ACTUAL_USER" | cut -d: -f6)

# Configuration
GAME_DIR="$USER_HOME/stickersnatch-arcade"
SERVICE_USER="$ACTUAL_USER"

echo "Configuration:"
echo "  User: $SERVICE_USER"
echo "  Home: $USER_HOME"
echo "  Game Directory: $GAME_DIR"
echo ""

# 1. Update system and install dependencies
echo "[1/6] Installing dependencies..."
apt update
apt install -y chromium-browser python3 unclutter xdotool

# 2. Create game directory if it doesn't exist
echo "[2/6] Setting up game directory..."
if [ ! -d "$GAME_DIR" ]; then
  mkdir -p "$GAME_DIR"
  echo "  Created directory: $GAME_DIR"
  echo "  ⚠️  Remember to copy your game files to $GAME_DIR"
else
  echo "  Directory already exists: $GAME_DIR"
fi

# 3. Create web server systemd service
echo "[3/6] Creating web server service..."
cat > /etc/systemd/system/sticker-snatch-server.service <<EOF
[Unit]
Description=Sticker Snatch Game Web Server
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$GAME_DIR
ExecStart=/usr/bin/python3 -m http.server 8080
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable sticker-snatch-server.service
echo "  ✓ Web server service created and enabled"

# 4. Configure auto-login
echo "[4/6] Configuring auto-login..."
mkdir -p /etc/systemd/system/getty@tty1.service.d/
cat > /etc/systemd/system/getty@tty1.service.d/autologin.conf <<EOF
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin $SERVICE_USER --noclear %I \$TERM
EOF
echo "  ✓ Auto-login configured for user: $SERVICE_USER"

# 5. Create autostart directory and kiosk launcher
echo "[5/6] Creating kiosk autostart script..."
mkdir -p "$USER_HOME/.config/autostart"
mkdir -p "$USER_HOME/.config/lxsession/LXDE/autostart" 2>/dev/null || true

# Create the kiosk launch script
cat > "$USER_HOME/start-game.sh" <<'EOF'
#!/bin/bash
# Wait for server to be ready
sleep 3

# Hide mouse cursor
unclutter -idle 0.1 &

# Disable screen blanking and power management
xset s off
xset -dpms
xset s noblank

# Launch Chromium in kiosk mode
chromium-browser \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --no-first-run \
  --disable-session-crashed-bubble \
  --disable-features=TranslateUI \
  --disable-component-update \
  --check-for-update-interval=31536000 \
  --autoplay-policy=no-user-gesture-required \
  http://localhost:8080
EOF

chmod +x "$USER_HOME/start-game.sh"
chown "$SERVICE_USER:$SERVICE_USER" "$USER_HOME/start-game.sh"

# Create autostart entry
cat > "$USER_HOME/.config/autostart/sticker-snatch.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=Sticker Snatch Arcade
Exec=$USER_HOME/start-game.sh
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
EOF

chown -R "$SERVICE_USER:$SERVICE_USER" "$USER_HOME/.config"
echo "  ✓ Kiosk autostart configured"

# 6. Configure system settings for arcade use
echo "[6/6] Applying arcade-optimized settings..."

# Disable automatic updates
systemctl disable apt-daily.timer 2>/dev/null || true
systemctl disable apt-daily-upgrade.timer 2>/dev/null || true

echo "  ✓ System optimizations applied"

echo ""
echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Copy your game files to: $GAME_DIR"
echo "  2. Test the web server: sudo systemctl start sticker-snatch-server"
echo "  3. Reboot to test auto-boot: sudo reboot"
echo ""
echo "Useful commands:"
echo "  - Start server: sudo systemctl start sticker-snatch-server"
echo "  - Stop server: sudo systemctl stop sticker-snatch-server"
echo "  - Check status: sudo systemctl status sticker-snatch-server"
echo "  - View logs: sudo journalctl -u sticker-snatch-server"
echo ""
echo "To exit kiosk mode: Alt+F4 or Ctrl+Alt+F2 (switch to terminal)"
echo ""
