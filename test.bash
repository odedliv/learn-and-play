#!/bin/bash
# Test runner script for Learn and Play project
# Opens the test suite in Chrome after starting the Python server

echo "🧪 Learn and Play Test Suite Launcher"
echo "====================================="

# Schedule Chrome to open after a delay (runs in background)
(
    echo "⏳ Waiting for server to start..."
    sleep 2  # Wait 2 seconds for server to be ready

    echo "🌐 Opening test suite in Chrome..."

    # Try different ways to open Chrome (for Windows compatibility)
    if command -v chrome.exe &> /dev/null; then
        chrome.exe "http://localhost:8000/tests/test-runner.html" 2>/dev/null &
    elif command -v google-chrome &> /dev/null; then
        google-chrome "http://localhost:8000/tests/test-runner.html" 2>/dev/null &
    elif [ -f "/c/Program Files/Google/Chrome/Application/chrome.exe" ]; then
        "/c/Program Files/Google/Chrome/Application/chrome.exe" "http://localhost:8000/tests/test-runner.html" 2>/dev/null &
    elif [ -f "/c/Program Files (x86)/Google/Chrome/Application/chrome.exe" ]; then
        "/c/Program Files (x86)/Google/Chrome/Application/chrome.exe" "http://localhost:8000/tests/test-runner.html" 2>/dev/null &
    else
        # Fallback: try Windows 'start' command
        cmd.exe /c start "http://localhost:8000/tests/test-runner.html" 2>/dev/null &
        echo "⚠️  Could not find Chrome directly, trying default browser..."
    fi

    echo "✅ Browser launch command sent"
) &

# Now start the server in the foreground
echo "🚀 Starting Python HTTP server on port 8000..."
echo "📝 Server logs will appear below:"
echo "====================================="
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Run the server (this will block until Ctrl+C)
python -m http.server 8000

echo ""
echo "👋 Server stopped. Goodbye!"
