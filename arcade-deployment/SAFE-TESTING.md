# Safe Testing Guide - Don't Lock Yourself Out!

## Important: Nothing Is Permanent! ✅

You can test each step safely and reverse everything if needed. This guide walks you through testing WITHOUT enabling auto-boot first.

---

## Safe Testing Process (Recommended)

### Step 1: Test the Game Files Locally First

Before any setup, just test that your game works:

```bash
# Navigate to your game folder
cd ~/stickersnatch-arcade

# Start a simple web server manually
python3 -m http.server 8080
```

Then open a browser and go to: `http://localhost:8080`

**✓ Game works?** Continue to Step 2.  
**✗ Game doesn't work?** Fix the game files first, no system changes made yet!

Press `Ctrl+C` in the terminal to stop the server.

---

### Step 2: Test the Systemd Service (Without Auto-Boot)

Let's test the web server service but NOT enable auto-boot yet:

```bash
# Copy just the service file
sudo cp ~/arcade-setup/sticker-snatch-server.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Start the service manually (DON'T enable it yet)
sudo systemctl start sticker-snatch-server

# Check if it's running
sudo systemctl status sticker-snatch-server
```

You should see "active (running)" in green.

**Test it:** Open browser to `http://localhost:8080`

**To stop the server:**
```bash
sudo systemctl stop sticker-snatch-server
```

**At this point:** Service runs only when you start it manually. Nothing auto-boots.

---

### Step 3: Test Kiosk Mode (Without Auto-Start)

Test the fullscreen kiosk mode manually:

```bash
# Make sure web server is running
sudo systemctl start sticker-snatch-server

# Run the kiosk script manually
~/start-game.sh
```

**To exit kiosk mode:**
- Press `Alt + F4`
- Or press `Ctrl + Alt + F2` (switches to terminal)

**At this point:** Kiosk mode only runs when YOU run it. Nothing auto-starts on boot.

---

### Step 4: Enable Auto-Boot (When You're Ready)

Only do this when you've tested everything and you're satisfied:

```bash
# Enable the web server to start on boot
sudo systemctl enable sticker-snatch-server

# Set up auto-login (this is what makes it boot to game)
sudo ~/arcade-setup/setup.sh
```

Or run JUST the auto-login part manually:
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

**Now it will auto-boot to the game.**

---

## How to Reverse/Disable Everything

### Disable Auto-Boot to Game (Get Desktop Back)

**Option 1: Disable the autostart script**
```bash
# Switch to terminal (Ctrl+Alt+F2 if in kiosk mode)
# Login with your username/password

mv ~/.config/autostart/sticker-snatch.desktop ~/.config/autostart/sticker-snatch.desktop.DISABLED
sudo reboot
```

Now you'll boot to normal desktop!

**Option 2: Disable auto-login**
```bash
sudo rm /etc/systemd/system/getty@tty1.service.d/autologin.conf
sudo systemctl daemon-reload
sudo reboot
```

Now you'll get a normal login screen.

---

### Disable the Web Server

**Stop it temporarily:**
```bash
sudo systemctl stop sticker-snatch-server
```

**Disable it from auto-starting:**
```bash
sudo systemctl disable sticker-snatch-server
```

**Remove it completely:**
```bash
sudo systemctl stop sticker-snatch-server
sudo systemctl disable sticker-snatch-server
sudo rm /etc/systemd/system/sticker-snatch-server.service
sudo systemctl daemon-reload
```

---

### Complete Uninstall (Nuclear Option)

Remove everything we installed:

```bash
# Disable and remove service
sudo systemctl stop sticker-snatch-server
sudo systemctl disable sticker-snatch-server
sudo rm /etc/systemd/system/sticker-snatch-server.service

# Remove auto-login
sudo rm /etc/systemd/system/getty@tty1.service.d/autologin.conf

# Remove autostart
rm ~/.config/autostart/sticker-snatch.desktop
rm ~/start-game.sh

# Reload systemd
sudo systemctl daemon-reload

# Reboot to normal system
sudo reboot
```

**Your system is back to normal!**

---

## Editing the Game After Setup

You can ALWAYS edit your game files, even with auto-boot enabled!

### Method 1: Edit While in Kiosk Mode

1. Exit kiosk mode: Press `Alt + F4`
2. Open file manager or text editor
3. Navigate to `~/stickersnatch-arcade/`
4. Edit your files
5. Save changes
6. Restart the browser or reboot to see changes

### Method 2: SSH from Another Computer

If you have SSH enabled:
```bash
ssh youruser@arcade-pc-ip-address
cd ~/stickersnatch-arcade
nano index.html  # or use your preferred editor
```

### Method 3: Temporarily Disable Kiosk

```bash
# From terminal (Ctrl+Alt+F2)
mv ~/.config/autostart/sticker-snatch.desktop ~/.config/autostart/sticker-snatch.desktop.DISABLED
sudo reboot
```

Now you boot to desktop, edit freely, then re-enable:
```bash
mv ~/.config/autostart/sticker-snatch.desktop.DISABLED ~/.config/autostart/sticker-snatch.desktop
```

---

## Emergency Access

**If you get locked out and can't access anything:**

### Option 1: Access Terminal During Boot
1. When the system boots, quickly press `Ctrl + Alt + F2`
2. Login with your username/password
3. You now have terminal access

### Option 2: Boot to Recovery Mode
1. Restart the computer
2. Hold `Shift` during boot to access GRUB menu
3. Select "Advanced Options" → "Recovery Mode"
4. Select "Root shell" for terminal access

### Option 3: Boot from USB
1. Create a Ubuntu live USB
2. Boot from it
3. Mount your hard drive
4. Delete the autostart file from the mounted drive

---

## Recommended Testing Order

✅ **Safe progression:**

1. ✓ Test game with manual web server
2. ✓ Test systemd service (don't enable auto-start)
3. ✓ Test kiosk mode manually
4. ✓ Make sure you can exit kiosk mode
5. ✓ Enable auto-boot only when satisfied
6. ✓ Test reboot to confirm it works
7. ✓ Practice exiting kiosk mode again
8. ✓ Practice editing a file to confirm you can

---

## Quick Command Reference

```bash
# Start server manually (safe testing)
sudo systemctl start sticker-snatch-server

# Stop server
sudo systemctl stop sticker-snatch-server

# Enable auto-start (commits to auto-boot)
sudo systemctl enable sticker-snatch-server

# Disable auto-start (removes auto-boot)
sudo systemctl disable sticker-snatch-server

# Check status
sudo systemctl status sticker-snatch-server

# Disable kiosk auto-start
mv ~/.config/autostart/sticker-snatch.desktop ~/.config/autostart/sticker-snatch.desktop.DISABLED

# Re-enable kiosk auto-start
mv ~/.config/autostart/sticker-snatch.desktop.DISABLED ~/.config/autostart/sticker-snatch.desktop
```

---

## Summary

- ✅ You can test step-by-step
- ✅ Nothing is permanent
- ✅ Easy to disable auto-boot
- ✅ Easy to access desktop
- ✅ Easy to edit files
- ✅ Multiple escape routes if locked out
- ✅ Can completely uninstall everything

**Don't worry - you won't lock yourself out!** 🔓
