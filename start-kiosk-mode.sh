#!/bin/bash
# Launch game in kiosk mode on Mac (for arcade testing)
# Press Cmd+Q to exit

cd "$(dirname "$0")"

# Kill any existing Chrome instances
pkill -9 "Google Chrome" 2>/dev/null

# Kill any existing server on port 8080
lsof -ti:8080 | xargs kill -9 2>/dev/null

# Start server in background
echo "Starting local server..."
python3 -m http.server 8080 &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Launch Chrome in kiosk mode
echo "Launching game in kiosk mode..."
echo "Press Cmd+Q to exit"
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --no-first-run \
  --disable-session-crashed-bubble \
  --autoplay-policy=no-user-gesture-required \
  http://localhost:8080

# When Chrome exits, kill the server
kill $SERVER_PID 2>/dev/null
echo "Stopped."
