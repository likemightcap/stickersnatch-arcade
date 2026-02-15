# Sticker Snatch - Arcade Cabinet Deployment Guide

## Overview
This guide will help you set up your Sticker Snatch game on a Linux mini-PC to run as a dedicated arcade cabinet. The system will boot directly into the game with no user interaction required.

## What This Does
- ✅ Auto-boots into the game on power-on
- ✅ Runs completely offline (no internet required)
- ✅ Fullscreen kiosk mode (no browser UI)
- ✅ Auto-restarts if the game crashes
- ✅ Optimized for arcade cabinet use

## Requirements
- Mini-PC or regular PC
- Ubuntu, Debian, or Raspberry Pi OS (any Debian-based Linux)
- USB drive (for file transfer)
- Keyboard (for initial setup only)

---

## Installation Instructions

### Step 1: Prepare Your Linux System

1. **Install a minimal Linux distribution:**
   - Recommended: **Ubuntu Desktop 22.04 LTS** or **Raspberry Pi OS**
   - Install with default settings
   - Create a user account (e.g., username: `arcade`)

2. **Complete the OS installation and boot to desktop**

### Step 2: Transfer Game Files

1. **Copy the entire game folder to a USB drive:**
   - Copy everything from `stickersnatch-arcade` folder
   - Include all assets, HTML, CSS, JS files

2. **On the mini-PC, create the game directory:**
   ```bash
   mkdir -p ~/stickersnatch-arcade
   ```

3. **Copy files from USB to the mini-PC:**
   ```bash
   cp -r /media/*/USB_NAME/stickersnatch-arcade/* ~/stickersnatch-arcade/
   ```

### Step 3: Run the Setup Script

1. **Copy the deployment files to the mini-PC:**
   ```bash
   mkdir -p ~/arcade-setup
   # Copy the entire arcade-deployment folder to ~/arcade-setup
   ```

2. **Make the setup script executable:**
   ```bash
   chmod +x ~/arcade-setup/setup.sh
   ```

3. **Run the setup script as root:**
   ```bash
   sudo ~/arcade-setup/setup.sh
   ```

4. **The script will:**
   - Install Chromium browser and required packages
   - Set up auto-login
   - Create a web server service
   - Configure kiosk mode to auto-start
   - Optimize system for arcade use

### Step 4: Test Before Rebooting

1. **Start the web server manually:**
   ```bash
   sudo systemctl start sticker-snatch-server
   ```

2. **Check if it's running:**
   ```bash
   sudo systemctl status sticker-snatch-server
   ```
   You should see "active (running)" in green.

3. **Test in browser (optional):**
   ```bash
   chromium-browser http://localhost:8080
   ```

### Step 5: Reboot and Enjoy!

```bash
sudo reboot
```

The system will:
1. Boot up
2. Auto-login
3. Start the web server
4. Launch the game in fullscreen kiosk mode

---

## Manual Setup (Alternative Method)

If you prefer to set up manually or the automatic script doesn't work:

### 1. Install Dependencies
```bash
sudo apt update
sudo apt install -y chromium-browser python3 unclutter xdotool
```

### 2. Set Up Web Server Service
```bash
sudo cp sticker-snatch-server.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable sticker-snatch-server
sudo systemctl start sticker-snatch-server
```

### 3. Configure Auto-Login
Edit the getty service:
```bash
sudo mkdir -p /etc/systemd/system/getty@tty1.service.d/
sudo nano /etc/systemd/system/getty@tty1.service.d/autologin.conf
```

Add:
```ini
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin YOUR_USERNAME --noclear %I $TERM
```

### 4. Set Up Kiosk Autostart
```bash
cp start-game.sh ~/start-game.sh
chmod +x ~/start-game.sh

mkdir -p ~/.config/autostart
nano ~/.config/autostart/sticker-snatch.desktop
```

Add:
```ini
[Desktop Entry]
Type=Application
Name=Sticker Snatch Arcade
Exec=/home/YOUR_USERNAME/start-game.sh
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
```

---

## Troubleshooting

### Game Doesn't Start on Boot
1. Check if web server is running:
   ```bash
   sudo systemctl status sticker-snatch-server
   ```

2. Check logs:
   ```bash
   sudo journalctl -u sticker-snatch-server -f
   ```

3. Test autostart manually:
   ```bash
   ~/start-game.sh
   ```

### How to Exit Kiosk Mode
- **Method 1:** Press `Alt + F4`
- **Method 2:** Press `Ctrl + Alt + F2` (switch to terminal)
- **Method 3:** SSH in from another computer

### How to Access Desktop
If you need to access the desktop for maintenance:

1. **Before boot completes:**
   - Press `Ctrl + Alt + F2` to switch to terminal
   - Login with your username/password

2. **Disable autostart temporarily:**
   ```bash
   mv ~/.config/autostart/sticker-snatch.desktop ~/.config/autostart/sticker-snatch.desktop.disabled
   sudo reboot
   ```

3. **Re-enable later:**
   ```bash
   mv ~/.config/autostart/sticker-snatch.desktop.disabled ~/.config/autostart/sticker-snatch.desktop
   ```

### Performance Issues
- **Reduce resolution:** Edit `/boot/config.txt` (Raspberry Pi) or use `xrandr`
- **Disable effects:** Use a lightweight desktop environment (LXDE recommended)
- **Check temperature:** Ensure proper cooling

### Sounds Not Playing
Make sure audio is enabled and volume is up:
```bash
alsamixer
# Press M to unmute, use arrow keys to adjust volume
```

---

## System Maintenance

### Update the Game
1. Exit kiosk mode (Alt+F4)
2. Replace files in `~/stickersnatch-arcade/`
3. Reload the browser or reboot

### Stop the Game Service
```bash
sudo systemctl stop sticker-snatch-server
```

### Disable Auto-Boot (for maintenance)
```bash
sudo systemctl disable sticker-snatch-server
```

### Re-Enable Auto-Boot
```bash
sudo systemctl enable sticker-snatch-server
```

---

## Advanced Configuration

### Change Server Port
Edit the service file:
```bash
sudo nano /etc/systemd/system/sticker-snatch-server.service
```

Change `8080` to your desired port, then:
```bash
sudo systemctl daemon-reload
sudo systemctl restart sticker-snatch-server
```

### Custom Boot Logo
Replace the Plymouth boot splash (advanced):
```bash
sudo apt install plymouth-themes
# Follow Plymouth customization guides
```

### Remote Management
Enable SSH for remote access:
```bash
sudo apt install openssh-server
sudo systemctl enable ssh
```

---

## Hardware Recommendations

### Minimum Specs
- **CPU:** Dual-core 1.5GHz+
- **RAM:** 2GB
- **Storage:** 8GB
- **Graphics:** Any GPU with HTML5 Canvas support

### Recommended Mini-PCs
- Intel NUC
- Raspberry Pi 4 (4GB+ RAM recommended)
- Asus Mini PC PN series
- Any x86 mini-PC with 4GB+ RAM

### Tested Configurations
- ✅ Raspberry Pi 4 (4GB) - Works great
- ✅ Intel NUC i3 - Excellent performance
- ✅ Generic x86 mini-PC (4GB RAM) - Works well

---

## Files Included

- `setup.sh` - Automated setup script
- `start-game.sh` - Kiosk mode launcher
- `sticker-snatch-server.service` - Web server systemd service
- `README.md` - This file

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. View service logs: `sudo journalctl -u sticker-snatch-server`
3. Test the game in a regular browser first
4. Ensure all game files are present in the correct directory

---

## Quick Command Reference

```bash
# Start server
sudo systemctl start sticker-snatch-server

# Stop server
sudo systemctl stop sticker-snatch-server

# Restart server
sudo systemctl restart sticker-snatch-server

# Check status
sudo systemctl status sticker-snatch-server

# View logs
sudo journalctl -u sticker-snatch-server -f

# Reboot system
sudo reboot

# Shutdown system
sudo shutdown now
```

---

**Enjoy your arcade cabinet! 🎮**
