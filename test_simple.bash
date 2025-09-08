#!/bin/bash
# Simple test runner - opens Chrome after delay, then starts server

# Launch Chrome in 2 seconds (in background)
(sleep 2 && start chrome "http://localhost:8000/tests/test-runner.html") &

# Start server (blocks until Ctrl+C)
echo "Starting server on http://localhost:8000"
echo "Chrome will open automatically in 2 seconds..."
echo "Press Ctrl+C to stop"
python -m http.server 8000
