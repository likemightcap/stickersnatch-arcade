#!/bin/bash
# Sticker Snatch Arcade - Kiosk Mode Launcher
# This script is automatically run on user login

# Wait for system and web server to be ready
sleep 5

# Hide mouse cursor after 0.1 seconds of inactivity
unclutter -idle 0.1 &

# Disable screen blanking and power management
xset s off          # Disable screensaver
xset -dpms          # Disable DPMS (Energy Star) features
xset s noblank      # Don't blank the video device

# Launch Chromium in fullscreen kiosk mode
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
  --disable-background-timer-throttling \
  --disable-backgrounding-occluded-windows \
  --disable-renderer-backgrounding \
  http://localhost:8080

# If Chromium exits, restart it after 2 seconds
sleep 2
exec "$0"
