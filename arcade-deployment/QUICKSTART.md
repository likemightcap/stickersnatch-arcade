# Quick Start Guide - Arcade Cabinet Setup

## 🚀 5-Minute Setup

### On Your Mac (Right Now)
1. Copy the entire `stickersnatch-arcade` folder to a USB drive
2. Copy the `arcade-deployment` folder to the same USB drive

### On the Mini-PC (Linux)
1. **Plug in USB drive and open terminal**

2. **Copy files:**
   ```bash
   mkdir -p ~/stickersnatch-arcade
   cp -r /media/*/YOUR_USB_NAME/stickersnatch-arcade/* ~/stickersnatch-arcade/
   cp -r /media/*/YOUR_USB_NAME/arcade-deployment ~/arcade-setup
   ```

3. **Run setup:**
   ```bash
   cd ~/arcade-setup
   chmod +x setup.sh
   sudo ./setup.sh
   ```

4. **Reboot:**
   ```bash
   sudo reboot
   ```

**Done! Your arcade cabinet is ready!** 🎮

---

## What Just Happened?
- ✅ Web server installed and auto-starts on boot
- ✅ Chromium configured for fullscreen kiosk mode
- ✅ System auto-logs in and launches game
- ✅ 100% offline - no internet needed

## Exit Kiosk Mode
Press `Alt + F4` or `Ctrl + Alt + F2`

## Need Help?
Read the full [README.md](README.md) for detailed instructions and troubleshooting.
