#!/bin/bash
# Quick launcher for local testing
# Double-click this file or run: ./start-local-server.sh

cd "$(dirname "$0")"
echo "Starting local server at http://localhost:8080"
echo "Press Ctrl+C to stop"
echo ""
python3 -m http.server 8080
